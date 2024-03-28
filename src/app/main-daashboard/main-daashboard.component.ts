import { Component, OnInit, TemplateRef } from '@angular/core';
import { Task } from '../model/Task';
import { FormHandleService } from '../service/form-handle.service';
import * as jQuery from 'jquery';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';

@Component({
  selector: 'app-main-daashboard',
  templateUrl: './main-daashboard.component.html',
  styleUrls: ['./main-daashboard.component.css']
})
export class MainDaashboardComponent implements OnInit {
  newTask: Task = {
    title: '',
    description: '',
    status : '',
    dueDate: new Date()
  };

  tasks: Task[] = [];
  dbReady = false;
  editedTask: Task = { id: null, title: '', description: '', status: '', dueDate: new Date()  };
  modalRef: BsModalRef;
  currentButton: string = 'dashboard';
  pendingTasks: Task[] = [];
  completedTasks: Task[] = [];
  currentDate: Date = new Date(); // Current date
  selectedDate: Date | null = null; // Selected date with tasks

  tasksCalendar: Task[] = [
    { title: 'Task 1', dueDate: new Date(2024, 2, 10), description: 'Description of Task 1', status:'Pending' },
    { title: 'Task 2', dueDate: new Date(2024, 2, 15), description: 'Description of Task 2', status:'Pending' },
    { title: 'Task 3', dueDate: new Date(2024, 2, 20), description: 'Description of Task 3', status:'Pending' }
    // Add more tasks as needed
  ];

constructor (private indexedDbService: FormHandleService, private modalService: BsModalService) {
  this.currentDate = new Date();
}

ngOnInit(): void {
  this.indexedDbService.openDatabase().then(() => {
    this.dbReady = true;
    this.getTasks();
  }).catch(error => {
    console.error("Error initializing IndexedDB:", error);
  });
}

onDrop(event: CdkDragDrop<Task[]>): void {
  moveItemInArray(this.tasks, event.previousIndex, event.currentIndex);
}

toggleCard(taskId: number): void {
  const taskIndex = this.tasks.findIndex(task => task.id === taskId);
  if (taskIndex !== -1) {
    this.tasks[taskIndex].isExpanded = !this.tasks[taskIndex].isExpanded;
  }
}

previousMonth(): void {
  this.currentDate = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth() - 1, 1);
}

nextMonth(): void {
  this.currentDate = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth() + 1, 1);
}

onSelectDate(date: Date): void {
  this.selectedDate = date;
}

hasTasks(date: Date): boolean {
  return this.tasks.some(task => task.dueDate.toDateString() === date.toDateString());
}

getWeeks(): Date[][] {
  const weeks: Date[][] = [];
  const firstDayOfMonth = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth(), 1);
  const lastDayOfMonth = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth() + 1, 0);
  let startDate = new Date(firstDayOfMonth);
  let endDate = new Date(lastDayOfMonth);

  while (startDate <= endDate) {
    const week: Date[] = [];
    for (let i = 0; i < 7; i++) {
      if (startDate.getMonth() === this.currentDate.getMonth()) {
        week.push(new Date(startDate));
      } else {
        week.push(null); // Push null for days not in the current month
      }
      startDate.setDate(startDate.getDate() + 1);
    }
    weeks.push(week);
  }
  return weeks;
}


addTask(task: Task): void {
  task.status = 'Pending';
  this.indexedDbService.addTask(task);
  this.newTask = {
    title: '',
    description: '',
    status : '',
    dueDate: new Date()
  };
  this.getTasks()
}

getTasks(): void {
  this.indexedDbService.getTasks().then(tasks => {
    this.tasks = tasks.map(task => ({ ...task, isExpanded: false }));
    this.filterTasksByStatus()
  }).catch(error => {
    console.error("Error getting tasks from IndexedDB:", error);
  });
}

filterTasksByStatus(): void {
  this.pendingTasks = this.tasks.filter(task => task.status === 'Pending');
  this.completedTasks = this.tasks.filter(task => task.status === 'Completed');
}

deleteTask(taskId: number): void {
  this.indexedDbService.deleteTask(taskId).then(() => {
    console.log("Task deleted successfully");
    // After deleting the task, update the task list
    this.getTasks();
  }).catch(error => {
    console.error("Error deleting task:", error);
  });
}

openEditModal(task: Task): void {
  console.log("hello")
  // Set the editedTask to the task being edited
  // $('#editTaskModal').modal('show');
  this.editedTask = { ...task };
}

markAsCompleted(task: Task): void {
  task.status = 'Completed'; // Update task status to 'Completed'
  this.indexedDbService.updateTask(task); // Call service method to update the task
  this.getTasks()
}

saveEditedTask(): void {
  // Save the edited task
  this.indexedDbService.updateTask(this.editedTask).then(() => {
    console.log("Task updated successfully");
    // Close the modal or perform any other necessary actions
  }).catch(error => {
    console.error("Error updating task:", error);
  });
  this.getTasks()
  window.location.reload()
}

toggleDiv(button: string): void {
  switch (button) {
    case 'list':
    case 'calender':
    case 'board':
      this.currentButton = button;
      break;
    default:
      this.currentButton = 'dashboard';
      break;
  }
}



}
