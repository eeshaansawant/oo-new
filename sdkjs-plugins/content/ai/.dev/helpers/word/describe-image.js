(function () {
  let func = new RegisteredFunction({
    name: "describeImage",
    description:
      "Allows users to select an image and generate a meaningful title, description, caption, or alt text for it using AI.",
    parameters: {
      type: "object",
      properties: {
        prompt: {
          type: "string",
          description:
            "instruction for the AI (e.g., 'Add a short title for this chart.')",
        },
      },
      required: ["prompt"],
    },
    examples: [
      {
        prompt: "Add a short title for this chart.",
        arguments: { prompt: "Add a short title for this chart." },
      },
      {
        prompt: "Write me a 1–2 sentence description of this photo.",
        arguments: {
          prompt: "Write me a 1–2 sentence description of this photo.",
        },
      },
      {
        prompt: "Generate a descriptive caption for this organizational chart.",
        arguments: {
          prompt:
            "Generate a descriptive caption for this organizational chart.",
        },
      },
      {
        prompt: "Provide accessibility-friendly alt text for this infographic.",
        arguments: {
          prompt:
            "Provide accessibility-friendly alt text for this infographic.",
        },
      },
    ],
  });

  func.call = async function (params) {
    let prompt = params.prompt;

    async function insertMessage(message) {
      Asc.scope._message = String(message || "");
      await Asc.Editor.callCommand(function () {
        const msg = Asc. scope._message || "";
        const doc = Api.GetDocument();
        const selected =
          (doc.GetSelectedDrawings && doc.GetSelectedDrawings()) || [];
        if (selected.length > 0) {
          for (let i = 0; i < selected.length; i++) {
            const drawing = selected[i];
            const para = Api.CreateParagraph();
            para.AddText(msg);
            drawing.InsertParagraph(para, "after", true);
          }
        } else {
          const para = Api.CreateParagraph();
          para.AddText(msg);
          let range = doc.GetCurrentParagraph();
          range.InsertParagraph(para, "after", true);
        }
        Asc.scope._message = "";
      }, true);
    }

    try {
      let imageData = await new Promise((resolve) => {
        window. Asc.plugin.executeMethod(
          "GetImageDataFromSelection",
          [],
          function (result) {
            resolve(result);
          }
        );
      });

      if (!imageData || !imageData.src) {
        await insertMessage("Please select a valid image first.");
        return;
      }

      const whiteRectangleBase64 =
        "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==";
      if (imageData.src === whiteRectangleBase64) {
        await insertMessage("Please select a valid image first.");
        return;
      }

      let argPrompt = prompt + " (for the selected image)";
      let requestEngine = AI.Request.create(AI. ActionType.Chat);
      if (!requestEngine) {
        await insertMessage("AI request engine not available.");
        return;
      }

      const allowVision = /(vision|gemini|gpt-4o|gpt-4v|gpt-4-vision)/i;
      if (!allowVision. test(requestEngine. modelUI.name)) {
        await insertMessage(
          "⚠ This model may not support images. Please choose a vision-capable model (e.g.  GPT-4V, Gemini, etc.)."
        );
        return;
      }

      await Asc.Editor.callMethod("StartAction", [
        "Block",
        "AI (" + requestEngine. modelUI.name + ")",
      ]);
      await Asc.Editor. callMethod("StartAction", ["GroupActions"]);

      let messages = [
        {
          role: "user",
          content: [
            { type: "text", text: argPrompt },
            {
              type: "image_url",
              image_url: { url: imageData. src, detail: "high" },
            },
          ],
        },
      ];

      let resultText = "";
      await requestEngine.chatRequest(messages, false, async function (data) {
        if (data) {
          resultText += data;
        }
      });

      await Asc.Editor. callMethod("EndAction", ["GroupActions"]);
      await Asc.Editor. callMethod("EndAction", [
        "Block",
        "AI (" + requestEngine. modelUI.name + ")",
      ]);

      Asc.scope. text = resultText || "";

      if (! Asc.scope.text. trim()) {
        await insertMessage(
          "⚠ AI request failed (maybe the model cannot handle images)."
        );
        return;
      }
      await insertMessage(Asc.scope. text);
    } catch (e) {
      try {
        await Asc.Editor. callMethod("EndAction", ["GroupActions"]);
        await Asc. Editor.callMethod("EndAction", [
          "Block",
          "AI (describeImage)",
        ]);
      } catch (ee) {
        /* ignore */
      }
      console.error("describeImage error:", e);
      await insertMessage(
        "An unexpected error occurred while describing the image."
      );
    }
  };

  return func;
})();