export const MAIN_PATH = () => '/';
export const AUTH_PATH = () => '/auth';
export const SEARCH_PATH = (keyword: string) => `/search/${keyword}`;
export const USER_PATH = (userEmail: string) => `/user/${userEmail}`;
export const BOARD_PATH = () => '/board';
export const BOARD_DETAIL_PATH = (boardNumber: string | number) => `${boardNumber}`;
export const BOARD_UPDATE_PATH = (boardNumber: string | number) => `update/${boardNumber}`;
export const BOARD_WRITE_PATH = () => `write`;