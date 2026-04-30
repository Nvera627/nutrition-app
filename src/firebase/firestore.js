/**
 * firestore.js
 * All Firestore read/write helpers for BalanceBite.
 *
 * Security note: every write function explicitly picks only the expected fields
 * instead of spreading the whole object. This prevents a caller from accidentally
 * (or maliciously) writing extra fields like __proto__ into the database.
 */

import {
  collection,
  addDoc,
  getDocs,
  doc,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
  serverTimestamp,
  setDoc,
  getDoc,
} from 'firebase/firestore';
import { db } from './config';

// ─── Food Entries ─────────────────────────────────────────────────────────────

export async function addFoodEntry(userId, entry) {
  const ref = collection(db, `users/${userId}/foodEntries`);
  return addDoc(ref, {
    date:      String(entry.date),
    mealType:  String(entry.mealType),
    foodName:  String(entry.foodName).trim().slice(0, 200),
    calories:  Number(entry.calories)  || 0,
    protein:   Number(entry.protein)   || 0,
    carbs:     Number(entry.carbs)     || 0,
    fat:       Number(entry.fat)       || 0,
    createdAt: serverTimestamp(),
  });
}

export async function getFoodEntries(userId) {
  const ref = collection(db, `users/${userId}/foodEntries`);
  const q = query(ref, orderBy('date', 'desc'));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

export async function updateFoodEntry(userId, entryId, updates) {
  const ref = doc(db, `users/${userId}/foodEntries`, entryId);
  return updateDoc(ref, {
    date:     String(updates.date),
    mealType: String(updates.mealType),
    foodName: String(updates.foodName).trim().slice(0, 200),
    calories: Number(updates.calories)  || 0,
    protein:  Number(updates.protein)   || 0,
    carbs:    Number(updates.carbs)     || 0,
    fat:      Number(updates.fat)       || 0,
  });
}

export async function deleteFoodEntry(userId, entryId) {
  return deleteDoc(doc(db, `users/${userId}/foodEntries`, entryId));
}

// ─── Water Logs ───────────────────────────────────────────────────────────────

export async function addWaterLog(userId, log) {
  const ref = collection(db, `users/${userId}/waterLogs`);
  return addDoc(ref, {
    date:      String(log.date),
    ounces:    Number(log.ounces) || 0,
    createdAt: serverTimestamp(),
  });
}

export async function getWaterLogs(userId) {
  const ref = collection(db, `users/${userId}/waterLogs`);
  const q = query(ref, orderBy('date', 'desc'));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

export async function updateWaterLog(userId, logId, updates) {
  return updateDoc(doc(db, `users/${userId}/waterLogs`, logId), {
    date:   String(updates.date),
    ounces: Number(updates.ounces) || 0,
  });
}

export async function deleteWaterLog(userId, logId) {
  return deleteDoc(doc(db, `users/${userId}/waterLogs`, logId));
}

// ─── Weight Logs ──────────────────────────────────────────────────────────────

export async function addWeightLog(userId, log) {
  const ref = collection(db, `users/${userId}/weightLogs`);
  return addDoc(ref, {
    date:      String(log.date),
    weight:    Number(log.weight) || 0,
    createdAt: serverTimestamp(),
  });
}

export async function getWeightLogs(userId) {
  const ref = collection(db, `users/${userId}/weightLogs`);
  const q = query(ref, orderBy('date', 'desc'));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

export async function updateWeightLog(userId, logId, updates) {
  return updateDoc(doc(db, `users/${userId}/weightLogs`, logId), {
    date:   String(updates.date),
    weight: Number(updates.weight) || 0,
  });
}

export async function deleteWeightLog(userId, logId) {
  return deleteDoc(doc(db, `users/${userId}/weightLogs`, logId));
}

// ─── Exercise Logs ────────────────────────────────────────────────────────────

export async function addExerciseLog(userId, log) {
  const ref = collection(db, `users/${userId}/exerciseLogs`);
  return addDoc(ref, {
    date:           String(log.date),
    activity:       String(log.activity).trim().slice(0, 100),
    minutes:        Number(log.minutes)        || 0,
    caloriesBurned: Number(log.caloriesBurned) || 0,
    createdAt:      serverTimestamp(),
  });
}

export async function getExerciseLogs(userId) {
  const ref = collection(db, `users/${userId}/exerciseLogs`);
  const q = query(ref, orderBy('date', 'desc'));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

export async function updateExerciseLog(userId, logId, updates) {
  return updateDoc(doc(db, `users/${userId}/exerciseLogs`, logId), {
    date:           String(updates.date),
    activity:       String(updates.activity).trim().slice(0, 100),
    minutes:        Number(updates.minutes)        || 0,
    caloriesBurned: Number(updates.caloriesBurned) || 0,
  });
}

export async function deleteExerciseLog(userId, logId) {
  return deleteDoc(doc(db, `users/${userId}/exerciseLogs`, logId));
}

// ─── Goals ────────────────────────────────────────────────────────────────────

export async function getGoals(userId) {
  const snap = await getDoc(doc(db, `users/${userId}/goals`, 'current'));
  return snap.exists() ? snap.data() : null;
}

export async function setGoals(userId, goals) {
  return setDoc(doc(db, `users/${userId}/goals`, 'current'), {
    calorieGoal: Number(goals.calorieGoal) || 2000,
    proteinGoal: Number(goals.proteinGoal) || 150,
    carbGoal:    Number(goals.carbGoal)    || 250,
    fatGoal:     Number(goals.fatGoal)     || 65,
    waterGoal:   Number(goals.waterGoal)   || 64,
    weightGoal:  goals.weightGoal ? Number(goals.weightGoal) : null,
  }, { merge: true });
}

// ─── Dashboard Settings ───────────────────────────────────────────────────────

const DEFAULT_DASHBOARD = {
  showCalories: true,
  showMacros:   true,
  showWater:    true,
  showWeight:   true,
  showExercise: true,
};

export async function getDashboardSettings(userId) {
  const snap = await getDoc(doc(db, `users/${userId}/settings`, 'dashboard'));
  return snap.exists() ? snap.data() : DEFAULT_DASHBOARD;
}

export async function setDashboardSettings(userId, settings) {
  return setDoc(doc(db, `users/${userId}/settings`, 'dashboard'), {
    showCalories: Boolean(settings.showCalories),
    showMacros:   Boolean(settings.showMacros),
    showWater:    Boolean(settings.showWater),
    showWeight:   Boolean(settings.showWeight),
    showExercise: Boolean(settings.showExercise),
  }, { merge: true });
}

// ─── User Profile ─────────────────────────────────────────────────────────────

export async function getUserProfile(userId) {
  const snap = await getDoc(doc(db, 'users', userId));
  return snap.exists() ? snap.data() : null;
}
