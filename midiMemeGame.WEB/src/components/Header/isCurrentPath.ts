export function isCurrentPath(pathname: string, href: string) {
    const normalize = (path: string) => path.replace(/[?#].*$/, "").replace(/\/+$/, "") || "/";
    const current = normalize(pathname);
    const target = normalize(href);

    return current === target || (target !== "/" && current.startsWith(`${target}/`));
}
