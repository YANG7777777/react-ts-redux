/**
 * @file styles.d.ts
 * @description CSS Modules 声明文件
 * @author
 * @date 2023-05-11
**/

declare module '*.module.scss' {
    const classes: { [key: string]: string };
    export default classes;
}
