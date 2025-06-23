import stc from 'string-to-color';

export const useStringToColor = (str) => {
    if (!str) return '#000000';
    return stc(str);
}