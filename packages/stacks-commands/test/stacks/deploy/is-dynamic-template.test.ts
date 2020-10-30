import { isDynamicTemplate } from "../../../src/stacks/deploy/template"

const cases: Array<[string, boolean]> = [
  ["/template.hbs", true],
  ["/a/b/c/template.yml.hbs", true],
  ["/template.json.hbs", true],
  ["/dir/path/template.hbs.json", true],
  ["/template.hbs.yml", true],
  ["/dir/template.yml", false],
  ["/template.json", false],
]

describe("#isDynamicTemplate", () => {
  test.each(cases)(
    "when %s is given returns %s",
    (pathToTemplate, expected) => {
      expect(isDynamicTemplate(pathToTemplate)).toBe(expected)
    },
  )
})
