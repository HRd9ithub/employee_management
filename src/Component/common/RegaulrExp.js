


// /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/
// * email format 
export const emailFormat = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|.(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

//  * only number 
export const numberFormat = /^[0-9]+$/;

// * alph, number and space
export const alphNumSpaceFormat = /^[a-zA-Z0-9 ]*$/;

// * alph and space
export const alphSpaceFormat = /^[A-Za-z ]*$/;

// * alph and space and dot
export const alphSpaceDotFormat = /^[a-zA-Z. ]*$/;


// * alphabet
export const alphabetFormat = /^[A-Za-z]*$/;

// * alphabet, number  and desh
export const alphaNumDeshFormat = /^[A-Za-z0-9-]+$/;

// * alphabet, number 
export const alphaNumFormat = /^[a-zA-Z0-9]*$/;

// * password format
export const passwordFormat = /^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,}$/;

// * percentage format
export const percentageFormat = /(^100(\.0{1,2})?$)|(^([1-9]([0-9])?|0)(\.[0-9]{1,2})?$)/;

// * url format
// eslint-disable-next-line
export const urlFormat = /[-a-zA-Z0-9@:%_\+.~#?&//=]{2,256}\.[a-z]{2,4}\b(\/[-a-zA-Z0-9@:%_\+.~#?&//=]*)?/gi;

// gstin format
export const gstinRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}[Z]{1}[0-9A-Z]{1}$/;
