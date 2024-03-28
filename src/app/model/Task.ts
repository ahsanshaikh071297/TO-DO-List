export interface Task {
    id? : number;
    title : string;
    description : string;
    isExpanded?: boolean;
    status : string;
    dueDate : Date
}