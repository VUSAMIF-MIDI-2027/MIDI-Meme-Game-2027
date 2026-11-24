export function isCurrentPath(pathname: string, href: string, exact = false) {
    const normalize = (path: string) => path.replace(/[?#].*$/, "").replace(/\/+$/, "") || "/";
    const current = normalize(pathname);
    const target = normalize(href);

    return current === target || (!exact && target !== "/" && current.startsWith(`${target}/`));
}
