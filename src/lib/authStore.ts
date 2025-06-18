
'use client';

import type { User } from '@/types';

const AUTH_STORAGE_KEY = 'timeWiseCurrentUser';
const USERS_DB_STORAGE_KEY = 'timeWiseUsersDB';

const getDefaultUsers = (): User[] => [
  { id: 'admin001', username: 'admin', password: 'adminpassword', name: 'Site Administrator', role: 'admin' },
];

const loadUsersFromDB = (): User[] => {
  if (typeof window === 'undefined') return getDefaultUsers();

  let loadedUsers: User[] = [];
  const storedUsersStr = localStorage.getItem(USERS_DB_STORAGE_KEY);

  if (storedUsersStr) {
    try {
      const parsedUsers = JSON.parse(storedUsersStr) as User[];
      const adminExists = parsedUsers.some(u => u.username === 'admin' && u.role === 'admin');

      if (Array.isArray(parsedUsers) && parsedUsers.length > 0 && adminExists) {
        loadedUsers = parsedUsers.map(u => ({ ...u, role: u.role || 'teacher' }));
      } else {
        console.warn("Admin user not found, users list empty, or data malformed in localStorage, re-initializing default users.");
        loadedUsers = getDefaultUsers();
        localStorage.setItem(USERS_DB_STORAGE_KEY, JSON.stringify(loadedUsers));
      }
    } catch (e) {
      console.error("Failed to parse users DB from localStorage, re-initializing.", e);
      loadedUsers = getDefaultUsers();
      localStorage.setItem(USERS_DB_STORAGE_KEY, JSON.stringify(loadedUsers));
    }
  } else {
    loadedUsers = getDefaultUsers();
    localStorage.setItem(USERS_DB_STORAGE_KEY, JSON.stringify(loadedUsers));
  }
  return loadedUsers;
};

let users: User[] = loadUsersFromDB();

const saveUsersToDB = () => {
  if (typeof window !== 'undefined') {
    localStorage.setItem(USERS_DB_STORAGE_KEY, JSON.stringify(users));
  }
};

// Modified to return full User objects including passwords
export const getAllUsers = (): User[] => {
  return loadUsersFromDB();
};

export const registerUser = (usernameInput: string, passwordInput: string, nameInput: string): { success: boolean; message: string } => {
  if (typeof window === 'undefined') return { success: false, message: "Registration unavailable." };

  if (!usernameInput || !passwordInput || !nameInput) {
    return { success: false, message: "All fields are required." };
  }

  users = loadUsersFromDB();
  const existingUser = users.find(u => u.username === usernameInput);
  if (existingUser) {
    return { success: false, message: "Username already exists. Please choose another." };
  }

  const newUser: User = {
    id: `user-${crypto.randomUUID()}`,
    username: usernameInput,
    password: passwordInput,
    name: nameInput,
    role: 'teacher',
  };

  users.push(newUser);
  saveUsersToDB();

  return { success: true, message: "Registration successful! You can now log in." };
};

export const login = (usernameInput: string, passwordInput: string): Omit<User, 'password'> | null => {
  if (typeof window === 'undefined') return null;
  users = loadUsersFromDB();
  const user = users.find(u => u.username === usernameInput && u.password === passwordInput);
  if (user) {
    const { password, ...userToStore } = user;
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(userToStore));
    return userToStore;
  }
  return null;
};

export const logout = (): void => {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(AUTH_STORAGE_KEY);
};

export const getCurrentUser = (): Omit<User, 'password'> | null => {
  if (typeof window === 'undefined') return null;
  const storedUser = localStorage.getItem(AUTH_STORAGE_KEY);
  if (storedUser) {
    try {
      return JSON.parse(storedUser) as Omit<User, 'password'>;
    } catch (e) {
      console.error("Failed to parse user from localStorage", e);
      localStorage.removeItem(AUTH_STORAGE_KEY);
      return null;
    }
  }
  return null;
};
