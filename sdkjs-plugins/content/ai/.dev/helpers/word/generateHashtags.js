(function(){

let func = new RegisteredFunction();
func.name = "generateHashtags";

func.params = [
    {
        name: "prompt",
        type: "string",
        description: "Instruction for the AI, for example: 'Generate hashtags for this text.'",
        required: true
    },
    {
        name: "count",
        type: "number",
        description: "How many hashtags to generate (default is 5)",
        required: false
    }
];

func.description =
    "Use this function if you need to generate relevant hashtags for the selected text or current word.";

func.examples = [
    "if you need to generate hashtags for the selected text, respond with:\n" +
    "[functionCalling (generateHashtags)]: { \"prompt\": \"Generate hashtags for this text.\" }",

    "if you need to generate 10 hashtags for the selected text, respond with:\n" +
    "[functionCalling (generateHashtags)]: { \"prompt\": \"Generate hashtags for this text.\", \"count\": 10 }"
];

func.call = async function(params) {

let count = params.count || 5;

let text = await Asc.Editor.callCommand(function(){
    let doc = Api.GetDocument();
    let range = doc.GetRangeBySelect();
    let txt = range ? range.GetText() : "";

    if (!txt) {
        txt = doc.GetCurrentWord();
        doc.SelectCurrentWord();
    }

    return txt;
});

if (!text || text.trim().length === 0)
    return;

let argPromt =
    params.prompt + ":\n" +
    "Text:\n" + text + "\n" +
    "Generate " + count + " short and relevant hashtags. " +
    "Output hashtags only, separated by spaces.";

let requestEngine = AI.Request.create(AI.ActionType.Chat);
if (!requestEngine)
    return;

await Asc.Editor.callMethod("StartAction", ["GroupActions"]);
await Asc.Editor.callMethod("StartAction", ["Block", "AI (" + requestEngine.modelUI.name + ")"]);

let isSendedEndLongAction = false;
async function checkEndAction() {
    if (!isSendedEndLongAction) {
        await Asc.Editor.callMethod("EndAction", ["Block", "AI (" + requestEngine.modelUI.name + ")"]);
        isSendedEndLongAction = true;
    }
}

let resultText = "";

await requestEngine.chatRequest(argPromt, false, async function(data) {
    if (!data)
        return;
    resultText += data;
});

await checkEndAction();

resultText = resultText.replace(/\s+/g, " ").trim();

if (resultText) {
    Asc.scope.text = resultText;
    await Asc.Editor.callCommand(function(){
        let doc = Api.GetDocument();
        doc.MoveCursorToEnd();
        let par = Api.CreateParagraph();
        par.AddText(Asc.scope.text);
        doc.Push(par);
    });
}

await Asc.Editor.callMethod("EndAction", ["GroupActions"]);
};

return func;

})();