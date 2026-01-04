(function(){

let func = new RegisteredFunction({
  name: "smartHeadlineGenerator",
  description:
    "Generates a clear and relevant headline from the currently selected text (paragraph, slide, or section). This headline is meant to accurately represent the content, not be overly catchy.",
  parameters: {
    type: "object",
    properties: {
      scope: {
        type: "string",
        description:
          "whether to summarize the 'currentParagraph', 'selection', or the 'entireDocument' (default is 'selection')",
      },
    },
    required: ["prompt"],
  },
  examples: [
    {
      prompt: "Generate a headline for the selected text",
      arguments: {
        scope: "selection",
        prompt: "Generate a clear headline for this text",
      },
    },
    {
      prompt: "Write a headline for the current paragraph",
      arguments: {
        scope: "currentParagraph",
        prompt: "Write a precise headline for this paragraph",
      },
    },
    {
      prompt: "Create a headline",
      arguments: {
        scope: "entireDocument",
        prompt: "Create a headline that represents the full document",
      },
    },
    {
      prompt: "Suggest a simple headline for an announcement",
      arguments: {
        scope: "selection",
        prompt: "Provide a straightforward headline for this announcement",
      },
    },
    {
      prompt:
        "Generate a headline for the current paragraph without extra instructions",
      arguments: { scope: "currentParagraph" },
    },
  ],
});

func.call = async function (params) {
    let scope = params.scope || "selection";

    Asc.scope.scope = scope;
    let text = await Asc.Editor.callCommand(function () {
      let doc = Api.GetDocument();
      let content = "";
      // console.log('scope', Asc.scope.scope);
      if (Asc.scope.scope === "entireDocument") {
        content = doc.GetText();
      } else if (Asc.scope.scope === "currentParagraph") {
        let par = doc.GetCurrentParagraph();
        if (par) {
          par.Select();
          content = par.GetText();
        }
      } else {
        let range = doc.GetRangeBySelect();
        if (range && range.GetText()) {
          content = range.GetText();
        } else {
          let par = doc.GetCurrentParagraph();
          if (par) {
            par.Select();
            content = par.GetText();
          }
        }
      }
      return content;
    });
    if (!text) return;
    let argPrompt =
      params.prompt +
      ":\n" +
      text +
      "\n Answer with only the headline, do not add explanations.";

    let requestEngine = AI.Request.create(AI.ActionType.Chat);
    if (!requestEngine) return;

    await Asc.Editor.callMethod("StartAction", ["GroupActions"]);
    await Asc.Editor.callMethod("StartAction", [
      "Block",
      "AI (" + requestEngine.modelUI.name + ")",
    ]);

    let isSendedEndLongAction = false;
    async function checkEndAction() {
      if (!isSendedEndLongAction) {
        await Asc.Editor.callMethod("EndAction", [
          "Block",
          "AI (" + requestEngine.modelUI.name + ")",
        ]);
        isSendedEndLongAction = true;
      }
    }

    let resultHeading = "";
    await requestEngine.chatRequest(argPrompt, false, async function (data) {
      if (!data) return;
      resultHeading += data;
    });

    await checkEndAction();
    if (resultHeading.startsWith('"') && resultHeading.endsWith('"')) {
      resultHeading = resultHeading.slice(1, -1);
    }
    Asc.scope.data = resultHeading;
    await Asc.Editor.callCommand(async function () {
      let doc = Api.GetDocument(),
        data = Asc.scope.data;
      if (
        Asc.scope.scope === "entireDocument" ||
        Asc.scope.scope === "currentParagraph"
      ) {
        const contextPara =
          Asc.scope.scope === "entireDocument"
            ? doc.GetElement(0)
            : doc.GetCurrentParagraph();
        const textProperties = contextPara.GetTextPr();
        let headLine = Api.CreateParagraph();
        headLine.AddText(data);
        headLine.SetTextPr(textProperties);
        contextPara.InsertParagraph(headLine, "before", true);
      } else {
        let range = doc.GetRangeBySelect();
        if (!range) return;
        range.AddText(data + "\n\n", "before");
      }
    });
    await Asc.Editor.callMethod("EndAction", ["GroupActions"]);
  };
  return func;

  
})();