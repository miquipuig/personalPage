import { Injectable } from '@angular/core';

export interface Label {
  id: number;
  name: string;
  color: string;
  icon: string;
}


export interface Task {
  id: number;
  elementType: string;
  name: string;
  idPosition: number;
  segmentId: number | undefined | null;
  detail: string;
  label: number | undefined | null;
  estimatedTime: number;
  elapsedTime: number;
  restTime: number;
  isTaskDone: boolean;
  userStoryId: number;
  pomodoroCounter: number;
  pomodoroQuarterCounter: number;
  state: number;
  tasks: Task[];
  startDate: Date | undefined | null;
  endDate: Date | undefined | null;
}

export interface State {
  id: number;
  name: string;
  visibilityTaskList: boolean;
  visibilityKanban: boolean;
  idPosition: number;
  activityId: number | undefined | null;
}


@Injectable({
  providedIn: 'root'
})
export class TaskServicesService {

  constructor() {
    this.loadLabels();
    this.loadTasks();
    this.loadStates();

  }

  labels: Label[] = [];
  tasks: Task[] = [];
  filteredTasks: Task[] = [];
  states: State[] = [];
  taskLoaded: boolean = false;
  taskSaved: boolean = true;

  async loadTasks(): Promise<any> {
    this.taskLoaded = false;
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        try {
          if (localStorage.getItem('tasks') !== null && localStorage.getItem('tasks') !== undefined && localStorage.getItem('tasks') !== '[]') {
            this.tasks = this.orderTasks(JSON.parse(localStorage.getItem('tasks')!));
          }
          this.taskLoaded = true;
          resolve(this.tasks);
        } catch (error) {
          reject([]);
        }
      }, 1000); // Simula un retraso de 1 segundo
    });
  }

  loadStates(): void {
    if (localStorage.getItem('states') !== null && localStorage.getItem('states') !== undefined && localStorage.getItem('states') !== '[]') {
      this.states = JSON.parse(localStorage.getItem('states')!);
    } else {
      this.states = [
        { id: 1, name: 'To Do', visibilityTaskList: true, visibilityKanban: true, idPosition: 100, activityId: undefined },
        { id: 2, name: 'Doing', visibilityTaskList: true, visibilityKanban: true, idPosition: 200, activityId: undefined },
        { id: 3, name: 'Done', visibilityTaskList: false, visibilityKanban: true, idPosition: 300, activityId: undefined }
      ];
      this.saveStates();
    }
  }

  orderTasks(tasks: Task[]): Task[] {
    return tasks.sort((a, b) => a.idPosition - b.idPosition);
  }

  getTaskById(id: number): Task {
    return this.tasks.find(task => task.id === id)!;
  }

  async addTask(task: Task): Promise<any> {
    this.taskSaved = false;
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        try {
          //iterate to get the unique id
          let id = 1;

          while (this.tasks.find(task => task.id === id) !== undefined) {
            id++;
          }
          task.id = id;
          task.idPosition = this.tasks.length * 100;
          this.tasks.push(task);
          localStorage.setItem('tasks', JSON.stringify(this.tasks));
          this.taskSaved = true;
          resolve(task);
        } catch (error) {
          reject(this.tasks);
        }
      }, 1000); // Simula un retraso de 1 segundo
    });
  }


  async addTaskByChild(task: Task): Promise<Task> {
    this.taskSaved = false;
    return new Promise(async (resolve, reject) => {

      const name = task.name;
      let segment: Task;
      if (this.tasks.find(task => task.name === name) !== undefined) {
        segment = this.tasks.find(task => task.name === name)!;
        console.log(segment);
        resolve(segment);
      } else {
        const taskE = await this.addTask(task)
        console.log(taskE);
        resolve(taskE);
      }
    });


  }

  async saveTask(task: Task): Promise<any> {
    this.taskSaved = false;
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        try {

          const index = task.id;
          let foundTask = this.tasks.find(t => t.id === index);
          let copyTask: Task = JSON.parse(JSON.stringify(task));

          if (foundTask) {
            Object.assign(foundTask, copyTask);
            localStorage.setItem('tasks', JSON.stringify(this.tasks));
          }
          this.taskSaved = true;

          resolve(copyTask);
        } catch (error) {
          reject(task);
        }
      }, 1000); // Simula un retraso de 1 segundo
    });
  }

  async deleteTask(id: number): Promise<any> {
    this.taskSaved = false;

    return new Promise((resolve, reject) => {
      setTimeout(() => {
        try {
          let task = this.getTaskById(id);
          if (task.tasks !== undefined && task.tasks.length > 0) {
            task.tasks.forEach(child => {
              this.tasks.forEach(task => {
                if (task.id === child.id) {
                  task.segmentId = undefined;
                }
              });
            });
          }
          this.tasks = this.tasks.filter(task => task.id !== id);
            localStorage.setItem('tasks', JSON.stringify(this.tasks));
            this.taskSaved = true;
            resolve(this.tasks);
          } catch (error) {
            reject(error);
          }
        }, 1000); // Simula un retraso de 1 segundo
    });
  }
  async saveStates(): Promise<any> {
    this.taskLoaded = false;

    return new Promise((resolve, reject) => {
      setTimeout(() => {
        try {
          localStorage.setItem('states', JSON.stringify(this.states));
          this.taskLoaded = true;

          resolve('States saved');
        } catch (error) {
          reject(error);
        }
      }, 1000); // Simula un retraso de 1 segundo
    });
  }

  async addState(state: State): Promise<any> {
    this.taskLoaded = false;

    return new Promise((resolve, reject) => {
      setTimeout(() => {
        try {
          let id = 1;

          while (this.states.find(state => state.id === id) !== undefined) {
            id++;
          }
          state.id = id;
          state.idPosition = this.states.length * 100;
          this.states.push(state);
          localStorage.setItem('states', JSON.stringify(this.states));
          this.taskLoaded = true;
          resolve(state);
        } catch (error) {
          reject(this.states);
        }
      }, 1000); // Simula un retraso de 1 segundo
    });
  }
  async saveState(state: State): Promise<State[]> {
    this.taskLoaded = false;

    return new Promise((resolve, reject) => {
      setTimeout(() => {
        try {
          const index = state.id;
          let foundState = this.states.find(s => s.id === index);
          if (foundState) {
            Object.assign(foundState, state);
          }
          localStorage.setItem('states', JSON.stringify(this.states));
          this.taskLoaded = true;

          resolve(this.states);
        } catch (error) {
          reject(this.states);
        }
      }, 1000); // Simula un retraso de 1 segundo
    });
  }

  async saveTasks(): Promise<any> {
    this.taskSaved = false;

    return new Promise((resolve, reject) => {
      setTimeout(() => {
        try {
          localStorage.setItem('tasks', JSON.stringify(this.tasks));
          this.taskSaved = true;

          resolve('Tasks saved');
        } catch (error) {
          reject(error);
        }
      }, 1000); // Simula un retraso de 1 segundo
    });
  }

  getLabels(): Label[] {
    return this.labels;
  }
  getLabelById(id: number): Label {
    return this.labels.find(label => label.id === id)!;
  }
  addLabel(label: Label): Label {
    if (!(label.name === '' || label.name === null || label.name === undefined)) {
      //set de id to the label don't repeat
      let id = 1;

      while (this.labels.find(label => label.id === id) !== undefined) {
        id++;
      }
      label.id = id;
      this.labels.push(label);
      this.saveLabels();
    }
    return label;


  }
  getOrderedLabelsPerName(): Label[] {
    return this.labels.sort((a, b) => a.name.localeCompare(b.name));
  }
  getLabelByName(name: string): Label {
    return this.labels.find(label => label.name === name)!;
  }
  //Add Label by Name if not exists
  addLabelByName(name: string): any {
    if (!this.labels.find(label => label.name === name) && name !== '' && name !== null && name !== undefined) {
      return this.addLabel({ id: this.labels.length + 1, name: name, color: '#FF69B4', icon: 'fa fa-question' });
    } else {
      return this.getLabelByName(name);
    }
  }
  deleteLabel(id: any): void {
    this.labels = this.labels.filter(label => label.id !== id);
    //Update the tasks with the old label
    this.tasks.forEach(task => {
      if (task.label === id) {
        task.label = undefined;
        this.saveTask(task);
      }
    });
    this.saveLabels();
  }

  saveLabel(label: Label): void {
    if (label.id === undefined) {
      this.addLabel(label);
    } else {
      this.updateLabel(label);
    }
    this.saveLabels();
  }



  updateLabel(label: Label): void {
    const index = this.labels.findIndex(l => l.id === label.id);
    if (index >= 0) {
      this.labels[index] = label;
    }
    this.saveLabels();
  }

  saveLabels(): void {
    localStorage.setItem('labels', JSON.stringify(this.labels));
  }
  loadLabels(): void {
    if (localStorage.getItem('labels') !== null && localStorage.getItem('labels') !== undefined && localStorage.getItem('labels') !== '[]') {
      this.labels = JSON.parse(localStorage.getItem('labels')!);
    } else {
      this.labels = [
        { id: 1, name: 'Task Planning', color: 'blue', icon: 'ri-list-check-3' },
        { id: 2, name: 'Work', color: 'red', icon: 'ri-macbook-line' },
        { id: 3, name: 'Study', color: 'yellow', icon: 'ri-graduation-cap-line' },
        { id: 4, name: 'Personal', color: 'purple', icon: 'ri-user-5-line' },
        { id: 5, name: 'Home', color: 'orange', icon: 'ri-home-5-line' }
      ];
    }
  }

  async moveElement(elementId: number, superiorId: Task | undefined, inferiorId: Task | undefined): Promise<Task[]> {
    let element = { ...this.tasks.find(task => task.id === elementId)! };
    let tasks = [...this.orderTasks(this.tasks)];
    let superiorElement: Task | undefined;
    let inferiorElement: Task | undefined;
    let position = 0;
    if (superiorId !== undefined) {
      //posició del element superior
      superiorElement = superiorId;
      position = superiorElement.idPosition + 1;
      let superiorIndex = tasks.findIndex(task => task.id === superiorId.id);

      if (tasks[superiorIndex + 1] !== undefined) {
        inferiorElement = tasks[superiorIndex + 1];
        if (inferiorElement.idPosition === position) {
          await this.moveElementUp(inferiorElement, tasks);
        }
      }
      element.idPosition = position;
      await this.saveTask({ ...element });
    } else if (inferiorId !== undefined) {
      let inferiorElement = inferiorId;
      position = inferiorElement.idPosition - 1;
      if (inferiorElement.idPosition === 0) {
        position = 0;
        await this.moveElementUp(inferiorElement, tasks);
      }
      element.idPosition = position;
      await this.saveTask(element);

    }
    return tasks;

  }



  async moveElementUp(element: Task, tasks: Task[]): Promise<any> {
    tasks = this.orderTasks(tasks);
    if (this.tasks.find(task => task.idPosition === element.idPosition + 1) !== undefined) {
      let nextElement = tasks.find(task => task.idPosition === element.idPosition + 1)!;
      await this.moveElementUp(nextElement, tasks);
    }
    element.idPosition++;
    await this.saveTask({ ...element });
  }

}