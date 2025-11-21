import { debugMode } from './config';

export const log = debugMode ? console.log.bind(console) : () => { };
