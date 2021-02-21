import { green, red } from "@takomo/util"
import { diffTemplate } from "../../../src/stacks/deploy-stacks/template"

// old, updated, expected
const cases = [
  [
    "foo\n" + "bar\n" + "baz\n",
    "foo\n" + "bar\n" + "baz\n",
    "  foo\n" + "  bar\n" + "  baz\n",
  ],
  [
    "foo\n" + "bar\n" + "baz\n",
    "foo\n" + "bar\n" + "baz\n",
    "  foo\n" + "  bar\n" + "  baz\n",
  ],
  [
    "foo\n" + "bar\n" + "baz\n",
    "foo\n" + "bar\n",
    "  foo\n" + "  bar\n" + red("- baz") + "\n",
  ],
  [
    "foo\n" + "bar\n" + "baz\n",
    "foo\n",
    "  foo\n" + red("- bar") + "\n" + red("- baz") + "\n",
  ],
  [
    "foo\n" + "bar\n",
    "foo\n" + "bar\n" + "baz\n",
    "  foo\n" + "  bar\n" + green("+ baz") + "\n",
  ],
  [
    "foo\n",
    "foo\n" + "bar\n" + "baz\n",
    "  foo\n" + green("+ bar") + "\n" + green("+ baz") + "\n",
  ],
  [
    "foo\n" + "bar\n" + "baz\n",
    "foo\n" + "bar\n" + "  hello\n" + "baz\n",
    "  foo\n" + "  bar\n" + green("+   hello") + "\n" + "  baz\n",
  ],
  [
    "foo\n" + "bar\n" + "baz\n",
    "foo\n" + "bar\n" + "  hello\n" + "  hello2\n" + "baz\n",
    "  foo\n" +
      "  bar\n" +
      green("+   hello") +
      "\n" +
      green("+   hello2") +
      "\n" +
      "  baz\n",
  ],
]

describe("#diffTemplate", () => {
  test.each(cases)("Test case %#", (current, updated, expected) => {
    expect(diffTemplate(current, updated)).toStrictEqual(expected)
  })
})
