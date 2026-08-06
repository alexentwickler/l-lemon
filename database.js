import { Platform } from 'react-native';
import * as SQLite from 'expo-sqlite';

// expo-sqlite has no web implementation, so the browser build keeps the menu in
// memory for the lifetime of the page. Every exported function has the same
// signature on both platforms.
const isWeb = Platform.OS === 'web';
const db = isWeb ? null : SQLite.openDatabase('little_lemon_capstone.db');

let webMenuItems = [];

// A dish name is matched literally, so % and _ typed into the search field mean
// themselves rather than SQL wildcards — the same thing String.includes does on
// the web path.
const escapeLike = (value) => value.replace(/[\\%_]/g, '\\$&');

export function createTable() {
  if (isWeb) return Promise.resolve();
  return new Promise((resolve, reject) => {
    db.transaction((tx) => {
      tx.executeSql(
        'create table if not exists menuitems (id integer primary key not null, name text, price text, description text, image text, category text);'
      );
    }, reject, resolve);
  });
}

export function getMenuItems() {
  if (isWeb) return Promise.resolve(webMenuItems);
  return new Promise((resolve, reject) => {
    db.transaction((tx) => {
      tx.executeSql('select * from menuitems', [], (_, { rows }) =>
        resolve(rows._array)
      );
    }, reject);
  });
}

export function saveMenuItems(menuItems) {
  if (isWeb) {
    webMenuItems = [...menuItems];
    return Promise.resolve();
  }
  if (!menuItems.length) return Promise.resolve();
  const placeholders = menuItems.map(() => '(?, ?, ?, ?, ?)').join(', ');
  const params = menuItems.flatMap((item) => [
    item.name,
    String(item.price),
    item.description,
    item.image,
    item.category,
  ]);
  return new Promise((resolve, reject) => {
    db.transaction((tx) => {
      tx.executeSql(
        `insert into menuitems (name, price, description, image, category) values ${placeholders}`,
        params
      );
    }, reject, resolve);
  });
}

export function filterByQueryAndCategories(query, activeCategories) {
  if (!activeCategories.length) return Promise.resolve([]);

  if (isWeb) {
    const needle = query.toLowerCase();
    return Promise.resolve(
      webMenuItems.filter(
        (item) =>
          item.name.toLowerCase().includes(needle) &&
          activeCategories.includes(item.category)
      )
    );
  }

  const placeholders = activeCategories.map(() => '?').join(', ');
  return new Promise((resolve, reject) => {
    db.transaction((tx) => {
      tx.executeSql(
        `select * from menuitems where name like ? escape '\\' and category in (${placeholders})`,
        [`%${escapeLike(query)}%`, ...activeCategories],
        (_, { rows }) => resolve(rows._array)
      );
    }, reject);
  });
}
