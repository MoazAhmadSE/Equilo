import stc from 'string-to-color';

const useStringToColor = (str) => {
    if (!str) return '#000000';
    return stc(str);
}
export default useStringToColor;