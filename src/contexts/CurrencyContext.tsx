// src/contexts/CurrencyContext.tsx
import { createContext, useContext, useEffect, useState } from 'react';
import { ref, onValue, off } from 'firebase/database';
import { auth, database } from '../firebase/firebaseConfig';

// Base currency is XAF (Central African CFA franc)
const BASE_CURRENCY = 'XAF';
const BASE_CURRENCY_RATE = 1;

type CurrencyData = {
    code: string;
    symbol: string;
    rate: number; // Conversion rate from XAF to this currency
    countries?: string[]; // Array of country names that use this currency
};

type CurrencyContextType = {
    currency: CurrencyData;
    formatPrice: (xafPrice: number) => string;
    convertPrice: (xafPrice: number) => number;
    loading: boolean;
};

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

// Enhanced currency map with country names in multiple languages
const CURRENCY_MAP: Record<string, CurrencyData> = {
    XAF: {
        code: 'XAF',
        symbol: 'FCFA',
        rate: 1,
        countries: [
            'Cameroun', 'Cameroon', 'Kamerun',
            'République Centrafricaine', 'Central African Republic',
            'Tchad', 'Chad',
            'Congo', 'Congo-Brazzaville',
            'Guinée Équatoriale', 'Equatorial Guinea',
            'Gabon'
        ]
    },
    EUR: {
        code: 'EUR',
        symbol: '€',
        rate: 0.0015,
        countries: [
            'France', 'Allemagne', 'Germany', 'Deutschland',
            'Italie', 'Italy', 'Italia', 'Belgique', 'Belgium',
            'Espagne', 'Spain', 'España', 'Portugal'
        ]
    },
    USD: {
        code: 'USD',
        symbol: '$',
        rate: 0.0016,
        countries: ['US', 'USA', 'United States', 'États-Unis']
    },
    GBP: {
        code: 'GBP',
        symbol: '£',
        rate: 0.0013,
        countries: ['UK', 'United Kingdom', 'Royaume-Uni', 'GB']
    },
    CHF: {
        code: 'CHF',
        symbol: 'CHF',
        rate: 0.0014,
        countries: ['Switzerland', 'Suisse', 'Schweiz', 'CH']
    }
};

const DEFAULT_CURRENCY = CURRENCY_MAP['XAF'];

// Helper function to find currency by country name
const findCurrencyByCountry = (countryName: string): CurrencyData => {
    const normalizedCountry = countryName.trim().toLowerCase();
    
    for (const currency of Object.values(CURRENCY_MAP)) {
        if (currency.countries?.some(
            country => country.toLowerCase() === normalizedCountry
        )) {
            return currency;
        }
    }
    
    return DEFAULT_CURRENCY;
};

export const CurrencyProvider = ({ children }: { children: React.ReactNode }) => {
    const [currency, setCurrency] = useState<CurrencyData>(DEFAULT_CURRENCY);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const determineCurrency = async () => {
            try {
                const user = auth.currentUser;

                if (user) {
                    // Get user's country from Firebase
                    const userRef = ref(database, `users/${user.uid}/country`);
                    
                    const unsubscribe = onValue(userRef, (snapshot) => {
                        const countryName = snapshot.val();
                        if (countryName) {
                            const detectedCurrency = findCurrencyByCountry(countryName);
                            setCurrency(detectedCurrency);
                        } else {
                            detectFromIP();
                        }
                        setLoading(false);
                    }, (error) => {
                        console.error('Error reading country:', error);
                        detectFromIP();
                    });

                    return () => off(userRef);
                } else {
                    detectFromIP();
                }
            } catch (error) {
                console.error('Error determining currency:', error);
                setCurrency(DEFAULT_CURRENCY);
                setLoading(false);
            }
        };

        const detectFromIP = async () => {
            try {
                const response = await fetch('https://ipapi.co/json/');
                const data = await response.json();
                const countryName = data.country_name;
                
                if (countryName) {
                    const detectedCurrency = findCurrencyByCountry(countryName);
                    setCurrency(detectedCurrency);
                } else {
                    setCurrency(DEFAULT_CURRENCY);
                }
            } catch (error) {
                console.error('Error detecting country from IP:', error);
                setCurrency(DEFAULT_CURRENCY);
            } finally {
                setLoading(false);
            }
        };

        const unsubscribeAuth = auth.onAuthStateChanged(() => {
            determineCurrency();
        });

        return () => {
            unsubscribeAuth();
        };
    }, []);

    // Convert XAF price to user's currency
    const convertPrice = (xafPrice: number): number => {
        if (!xafPrice || isNaN(xafPrice)) return 0;
        if (currency.code === BASE_CURRENCY) return xafPrice;
        return parseFloat((xafPrice * currency.rate).toFixed(4));
    };

    // Format price according to currency conventions
    const formatPrice = (xafPrice: number): string => {
        const convertedPrice = convertPrice(xafPrice);
        
        // Special formatting for XAF
        if (currency.code === 'XAF') {
            return `${xafPrice.toLocaleString('fr-FR')} ${currency.symbol}`;
        }

        // European-style formatting (€12.34)
        if (['EUR', 'USD', 'CAD', 'CHF'].includes(currency.code)) {
            return `${currency.symbol}${convertedPrice.toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
            })}`;
        }

        // UK-style formatting (£12.34)
        if (currency.code === 'GBP') {
            return `${currency.symbol}${convertedPrice.toFixed(2)}`;
        }

        // Default formatting
        return `${currency.symbol}${convertedPrice.toFixed(2)}`;
    };

    return (
        <CurrencyContext.Provider value={{ 
            currency, 
            formatPrice, 
            convertPrice, 
            loading 
        }}>
            {children}
        </CurrencyContext.Provider>
    );
};

export const useCurrency = () => {
    const context = useContext(CurrencyContext);
    if (!context) {
        throw new Error('useCurrency must be used within a CurrencyProvider');
    }
    return context;
};