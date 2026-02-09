import { ReactNode } from "react";

interface Meta {
    hidden?: boolean;
    icon?: ReactNode;
    title: string;
}

export interface BaseRoute {
    path?: string;
    index?: boolean;
    element?: ReactNode;
    name?: string;
    children?: BaseRoute[];
    meta?: Meta
}
