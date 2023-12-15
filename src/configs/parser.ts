import { createParser } from "@adifkz/exp-p";

const parser = createParser({});

parser.setFunctions({
  is_email: (value: any) => {
    try {
      return value?.match(
        /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/,
      );
    } catch (error) {
      return false;
    }
  },
  is_html_empty: (value: any) => {
    try {
      if (!value) return true;
      if (value === "<div></div>") return true;
      if (value === "<span></span>") return true;
      return false;
    } catch (error) {
      return false;
    }
  },
});

export {
  parser,
};