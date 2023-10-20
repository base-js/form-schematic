export const createDebounce = <T extends (..._args: any) => any>(func: T, timeout: number = 200) => {
  // eslint-disable-next-line no-undef
  let timer: NodeJS.Timeout | null;

  return (...args: Parameters<T>) => {
    if (timer) {
      clearTimeout(timer);
    }

    timer = setTimeout(() => {
      func.apply(this, args);
    }, timeout);
  };
};