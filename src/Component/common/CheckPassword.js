
let errorMsg = [
    "Password has a lowercase letter.",
    "Password has a uppercase letter.",
    "Password has a number.",
    "Password has at least 8 characters.",
    "Password has special characters."
]

let errorMessage = [];
export const checkPassword = (data) => {

    var lowerCase = /[a-z]/g;
    var upperCase = /[A-Z]/g;
    var numbers = /[0-9]/g;
    var specialChar = /[#?!@$%^&*-]/

    if (!data) {
        errorMessage = errorMsg;
    } else {
        if (!data.match(lowerCase)) {
            errorMessage.push("Password has a lowercase letter.");
        } else {
            let value = errorMessage.filter((val) => {
                return val !== "Password has a lowercase letter."
            })
            errorMessage = value
        }


        if (!data.match(upperCase)) {
            errorMessage.push("Password has a uppercase letter.")
        } else {
            let value = errorMessage.filter((val) => {
                return val !== "Password has a uppercase letter."
            })
            errorMessage = value
        }

        if (!data.match(numbers)) {
            errorMessage.push("Password has a Number.")
        } else {
            let value = errorMessage.filter((val) => {
                return val !== "Password has a Number."
            })
            errorMessage = value
        }

        if (data.length < 8) {
            errorMessage.push("Password has at least 8 characters.")
        } else {
            let value = errorMessage.filter((val) => {
                return val !== "Password has at least 8 characters."
            })
            errorMessage = value
        }

        if (!data.match(specialChar)) {
            errorMessage.push("Password has special characters.")
        } else {
            let value = errorMessage.filter((val) => {
                return val !== "Password has special characters."
            })
            errorMessage = value
        }

    }
    return [...new Set(errorMessage)]
}