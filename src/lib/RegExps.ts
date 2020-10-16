const REGEXPS = {
    IDENTIFIER: /[\w_]+/,
    INT: /[0-9]+/,
    FLOAT: /[+-]?(?:[0-9]*[.])?[0-9]+/,
    COLOR: /^#(?:[0-9a-fA-F]{3}){1,2}/,
    FILENAME: /^\w+\.(?:png|PNG|jpeg|JPEG|jpg|JPG)/,
    TEXT: /"[^'"]*"/,
    SEMICOLON: /;/,
    COMMA: /,/,
};

export default REGEXPS;
