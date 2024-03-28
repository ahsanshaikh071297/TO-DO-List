import { Injectable } from '@angular/core';
import { Task } from '../model/Task';

@Injectable({
  providedIn: 'root'
})
export class FormHandleService {
  private db: IDBDatabase;

  constructor() { 
    this.openDatabase();
  }

  public openDatabase(): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      const request = indexedDB.open('task_manager_db', 1);
  
      request.onerror = (event) => {
        console.error("IndexedDB error:", event);
        reject("Failed to open IndexedDB database.");
      };
  
      request.onsuccess = (event) => {
        this.db = request.result;
        resolve(); // Resolve the promise when database is successfully opened
      };
  
      request.onupgradeneeded = (event) => {
        const db = request.result;
        const objectStore = db.createObjectStore('tasks', { keyPath: 'id', autoIncrement: true });
        // You can define additional indexes or properties for tasks
        this.db = db; // Assign the database instance
      };
    });
  }
  
  

  addTask(task: Task): void {
    const transaction = this.db.transaction(['tasks'], 'readwrite');
    const objectStore = transaction.objectStore('tasks');
    const request = objectStore.add(task);

    request.onerror = (event) => {
      console.error("Error adding task:", event);
    };

    request.onsuccess = (event) => {
      console.log("Task added successfully");
    };
  }

  getTasks(): Promise<Task[]> {
    return new Promise<Task[]>((resolve, reject) => {
      if (!this.db) {
        console.error("IndexedDB database is not initialized.");
        reject("IndexedDB database is not initialized.");
        return;
      }
  
      const transaction = this.db.transaction(['tasks'], 'readonly');
      const objectStore = transaction.objectStore('tasks');
      const request = objectStore.getAll();
  
      request.onerror = (event) => {
        console.error("Error getting tasks:", event);
        reject(event);
      };
  
      request.onsuccess = (event) => {
        console.log("Tasks retrieved successfully:", request.result);
        resolve(request.result);
      };
    });
  }

  deleteTask(taskId: number): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      if (!this.db) {
        console.error("IndexedDB database is not initialized.");
        reject("IndexedDB database is not initialized.");
        return;
      }

      const transaction = this.db.transaction(['tasks'], 'readwrite');
      const objectStore = transaction.objectStore('tasks');
      const request = objectStore.delete(taskId);

      request.onerror = (event) => {
        console.error("Error deleting task:", event);
        reject(event);
      };

      request.onsuccess = (event) => {
        console.log("Task deleted successfully");
        resolve();
      };
    });
  }

  updateTask(task: Task): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      if (!this.db) {
        console.error("IndexedDB database is not initialized.");
        reject("IndexedDB database is not initialized.");
        return;
      }

      const transaction = this.db.transaction(['tasks'], 'readwrite');
      const objectStore = transaction.objectStore('tasks');
      const request = objectStore.put(task);

      request.onerror = (event) => {
        console.error("Error updating task:", event);
        reject(event);
      };

      request.onsuccess = (event) => {
        console.log("Task updated successfully");
        resolve();
      };
    });
  }
}
