/*
 * (c) Copyright Ascensio System SIA 2010-2025
 *
 * This program is a free software product. You can redistribute it and/or
 * modify it under the terms of the GNU Affero General Public License (AGPL)
 * version 3 as published by the Free Software Foundation. In accordance with
 * Section 7(a) of the GNU AGPL its Section 15 shall be amended to the effect
 * that Ascensio System SIA expressly excludes the warranty of non-infringement
 * of any third-party rights.
 *
 * This program is distributed WITHOUT ANY WARRANTY; without even the implied
 * warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR  PURPOSE. For
 * details, see the GNU AGPL at: http://www.gnu.org/licenses/agpl-3.0.html
 *
 * You can contact Ascensio System SIA at 20A-6 Ernesta Birznieka-Upish
 * street, Riga, Latvia, EU, LV-1050.
 *
 * The  interactive user interfaces in modified source and object code versions
 * of the Program must display Appropriate Legal Notices, as required under
 * Section 5 of the GNU AGPL version 3.
 *
 * Pursuant to Section 7(b) of the License you must retain the original Product
 * logo when distributing the program. Pursuant to Section 7(e) we decline to
 * grant you any rights under trademark law for use of our trademarks.
 *
 * All the Product's GUI elements, including illustrations and icon sets, as
 * well as technical writing content are licensed under the terms of the
 * Creative Commons Attribution-ShareAlike 4.0 International. See the License
 * terms at http://creativecommons.org/licenses/by-sa/4.0/legalcode
 *
 */

(function () {
  let func = new RegisteredFunction({
    name: "changeTextStyle",
    description:
      "Changes the text style of the selected text in the document. You can make the text bold, italic, underline, strikeout, change font size, or change the case of the text.",
    parameters: {
      type: "object",
      properties: {
        bold: {
          type: "boolean",
          description: "Whether to make the text bold",
        },
        italic: {
          type: "boolean",
          description: "Whether to make the text italic",
        },
        underline: {
          type: "boolean",
          description: "Whether to underline the text",
        },
        strikeout: {
          type: "boolean",
          description: "Whether to strike out the text",
        },
        fontSize: {
          type: "number",
          description: "Font size to apply to the selected text",
        },
        caseType: {
          type: "string",
          description:
            "'upper' for UPPERCASE, 'lower' for lowercase, 'sentence' for Sentence case, 'capitalize' for Capitalize Each Word, 'toggle' for tOGGLE cASE",
        },
      },
      required: ["prompt"],
    },
    examples: [
      {
        prompt: "Make the selected text bold and italic.",
        arguments: { bold: true, italic: true },
      },
      {
        prompt: "Underline the selected text.",
        arguments: { underline: true },
      },
      {
        prompt: "Strike out the selected text.",
        arguments: { strikeout: true },
      },
      {
        prompt: "Set the font size of selected text to 18.",
        arguments: { fontSize: 18 },
      },
      {
        prompt: "Make the selected text bold.",
        arguments: { bold: true },
      },
      {
        prompt: "Make the selected text non-italic.",
        arguments: { italic: false },
      },
      {
        prompt: "Make the selected text uppercase.",
        arguments: { caseType: "upper" },
      },
      {
        prompt: "Make the selected text lowercase.",
        arguments: { caseType: "lower" },
      },
      {
        prompt: "Make the selected text ToGgle Case.",
        arguments: { caseType: "toggle" },
      },
      {
        prompt: "Make the selected text Sentence case.",
        arguments: { caseType: "sentence" },
      },
      {
        prompt: "Make the selected text Capitalize Each Word.",
        arguments: { caseType: "capitalize" },
      },
    ],
    returns: {
      type: "object",
      description: "An object indicating which styles were changed.",
      properties: {
        isApply: {
          type: "boolean",
          description: "Indicates whether the text style was changed.",
        },
      },
      required: ["isApply"],
    },
  });
  func.call = async function (params) {
    Asc.scope.bold = params.bold;
    Asc.scope.italic = params.italic;
    Asc.scope.underline = params.underline;
    Asc.scope.strikeout = params.strikeout;
    Asc.scope.fontSize = params.fontSize;
    Asc.scope.caseType = params.caseType;
    await Asc.Editor.callCommand(function () {
      let doc = Api.GetDocument();
      let range = doc.GetRangeBySelect();
      if (!range || "" === range.GetText()) {
        doc.SelectCurrentWord();
        range = doc.GetRangeBySelect();
      }

      if (!range) return;

      if (undefined !== Asc.scope.bold) range.SetBold(Asc.scope.bold);

      if (undefined !== Asc.scope.italic) range.SetItalic(Asc.scope.italic);

      if (undefined !== Asc.scope.underline)
        range.SetUnderline(Asc.scope.underline);

      if (undefined !== Asc.scope.strikeout)
        range.SetStrikeout(Asc.scope.strikeout);

      if (undefined !== Asc.scope.fontSize)
        range.SetFontSize(Asc.scope.fontSize);

      // Case Type - Updated with robust logic from textcleaner.js
      if (undefined !== Asc.scope.caseType) {
        let text = range.GetText();

        if (!text || text.trim() === "") {
          text = doc.GetCurrentWord();
          if (text) {
            doc.SelectCurrentWord();
            range = doc.GetRangeBySelect();
          }
        }

        if (text && text.trim() !== "") {
          // Define case conversion functions
          let convertCase;
          switch (Asc.scope.caseType) {
            case "upper":
              convertCase = (t) => t.toUpperCase();
              break;
            case "lower":
              convertCase = (t) => t.toLowerCase();
              break;
            case "sentence":
              convertCase = (t) =>
                t.charAt(0).toUpperCase() + t.slice(1).toLowerCase();
              break;
            case "capitalize":
              convertCase = (t) => t.replace(/\b\w/g, (l) => l.toUpperCase());
              break;
            case "toggle":
              convertCase = (t) =>
                t
                  .split("")
                  .map((c) =>
                    c === c.toUpperCase() ? c.toLowerCase() : c.toUpperCase()
                  )
                  .join("");
              break;
            default:
              convertCase = (t) => t;
          }

          // Process paragraphs
          const processParagraphs = (paragraphs) => {
            for (let i = 0; i < paragraphs.length; i++) {
              const para = paragraphs[i];

              if (!para.GetElementsCount) continue;

              const elementsCount = para.GetElementsCount();
              let fullText = "";
              let runs = [];

              for (let j = 0; j < elementsCount; j++) {
                const elem = para.GetElement(j);
                if (elem.GetText) {
                  const text = elem.GetText();
                  if (text) {
                    fullText += text;
                    runs.push({
                      element: elem,
                      text: text,
                      length: text.length,
                    });
                  }
                }
              }

              if (fullText.trim() === "") continue;

              const newFullText = convertCase(fullText);

              if (newFullText !== fullText) {
                para.RemoveAllElements();
                let currentPos = 0;
                for (let k = 0; k < runs.length; k++) {
                  const run = runs[k];
                  const newRunText = newFullText.substring(
                    currentPos,
                    currentPos + run.length
                  );
                  const newRun = Api.CreateRun();

                  const oldPr = run.element.GetTextPr();
                  newRun.SetTextPr(oldPr);
                  newRun.AddText(newRunText);

                  para.AddElement(newRun);
                  currentPos += run.length;
                }
              }
            }
          };

          if (range && range.GetText && range.GetText().trim() !== "") {
            processParagraphs(range.GetAllParagraphs());
          } else {
            processParagraphs(doc.GetAllParagraphs());
          }
        }
      }
    });
  };

  return func;
})();



