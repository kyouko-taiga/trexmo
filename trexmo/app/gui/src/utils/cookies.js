export function readCookie(name) {
    let value = "; " + document.cookie
    let parts = value.split("; " + name + "=")

    return (parts.length == 2)
        ? parts.pop().split(";").shift()
        : undefined
}
