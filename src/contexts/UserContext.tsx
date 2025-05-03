// src/contexts/UserContext.tsx
import { createContext, useContext, useEffect, useState } from 'react';
import { auth, database } from '../firebase/firebaseConfig';
import { onAuthStateChanged, User } from 'firebase/auth';
import { ref, onValue } from 'firebase/database';

interface UserData {
  name: string;
  surname: string;
  email: string;
  birthday: string;
  country: string;
  street: string;
  town: string;
  zipCode: string;
  mobileNumber: string;
  role: string;
}

interface UserContextType {
  currentUser: User | null;
  userData: UserData | null;
  loading: boolean;
}

const UserContext = createContext<UserContextType>({
  currentUser: null,
  userData: null,
  loading: true,
});

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      if (user) {
        const userRef = ref(database, `users/${user.uid}`);
        onValue(userRef, (snapshot) => {
          const data = snapshot.val();
          setUserData(data);
          setLoading(false);
        });
      } else {
        setUserData(null);
        setLoading(false);
      }
    });

    return unsubscribe;
  }, []);

  return (
    <UserContext.Provider value={{ currentUser, userData, loading }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  return useContext(UserContext);
}