(function () {
  let func = new RegisteredFunction({
    name: "changeParagraphStyle",
    description:
      "Changes the style of a specific paragraph in the document by paragraph number.",
    parameters: {
      type: "object",
      properties: {
        prompt: {
          type: "string",
          description:
            "Instruction for the AI (e.g., 'Change paragraph 3 to Heading 1')",
        },
        parNumber: {
          type: "number",
          description: "The paragraph number to apply style changes to",
        },
        style: {
          type: "string",
          description:
            "The style name to apply (e.g., 'Heading 1', 'Heading 2', 'Normal', 'Title')",
        },
      },
      required: ["prompt"],
    },
    examples: [
      {
        prompt: "Change paragraph 3 to Heading 1.",
        arguments: { prompt: "Change paragraph 3 to Heading 1.", parNumber: 3, style: "Heading 1" },
      },
      {
        prompt: "Make the first paragraph a Title.",
        arguments: { prompt: "Make the first paragraph a Title.", parNumber: 1, style: "Title" },
      },
      {
        prompt: "Set paragraph 5 to Normal style.",
        arguments: { prompt: "Set paragraph 5 to Normal style.", parNumber: 5, style: "Normal" },
      },
    ],
  });

  func.call = async function (params) {
    Asc.scope.parNumber = params.parNumber;
    Asc.scope.styleName = params.style;
    await Asc.Editor.callCommand(function () {
      let doc = Api.GetDocument();
      let par = doc.GetElement(Asc.scope.parNumber - 1);
      if (!par) return;
      let style = doc.GetStyle(Asc.scope.styleName);
      par.SetStyle(style);
    });
  };

  return func;
})();