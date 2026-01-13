(function () {
  let func = new RegisteredFunction({
    name: "addChartToSlide",
    description:
      "Adds a chart to a slide in the presentation (152x89mm, centered). Supports various chart types including bar, line, pie, scatter, and more. Can generate chart data using AI if a prompt is provided.",
    parameters: {
      type: "object",
      properties: {
        slideNumber: {
          type: "number",
          description:
            "Slide number to add chart to (optional, defaults to current slide)",
        },
        chartType: {
          type: "string",
          description:
            "Type of chart: bar, barStacked, barStackedPercent, bar3D, barStacked3D, barStackedPercent3D, barStackedPercent3DPerspective, horizontalBar, horizontalBarStacked, horizontalBarStackedPercent, horizontalBar3D, horizontalBarStacked3D, horizontalBarStackedPercent3D, lineNormal, lineStacked, lineStackedPercent, line3D, pie, pie3D, doughnut, scatter, stock, area, areaStacked, areaStackedPercent",
        },
        data: {
          type: "array",
          description:
            "2D array of numeric data values - all sub-arrays must have same length, number of arrays must match series count",
        },
        series: {
          type: "array",
          description:
            "Array of series names - must have same length as data arrays count",
        },
        categories: {
          type: "array",
          description:
            "Array of category names - must have same length as each data array",
        },
        prompt: {
          type: "string",
          description:
            "Description of what kind of data to generate for the chart using AI (optional, use instead of data/series/categories)",
        },
      },
      required: ["chartType"],
    },
    examples: [
      {
        prompt: "Add a bar chart showing sales data on slide 2.",
        arguments: {
          slideNumber: 2,
          chartType: "bar3D",
          data: [
            [100, 120, 140],
            [90, 110, 130],
          ],
          series: ["Product A", "Product B"],
          categories: ["Q1", "Q2", "Q3"],
        },
      },
      {
        prompt: "Add a pie chart on the current slide.",
        arguments: {
          chartType: "pie",
          data: [[30, 25, 20, 15, 10]],
          series: ["Market Share"],
          categories: [
            "Company A",
            "Company B",
            "Company C",
            "Company D",
            "Others",
          ],
        },
      },
      {
        prompt: "Add a line chart with 3 series and 4 data points.",
        arguments: {
          chartType: "lineNormal",
          data: [
            [10, 20, 30, 40],
            [15, 25, 35, 45],
            [12, 22, 32, 42],
          ],
          series: ["Series 1", "Series 2", "Series 3"],
          categories: ["Jan", "Feb", "Mar", "Apr"],
        },
      },
      {
        prompt:
          "Create a chart showing monthly revenue for 2024 with steady growth from $50k to $120k.",
        arguments: {
          slideNumber: 3,
          chartType: "lineNormal",
          prompt:
            "Create monthly revenue data for 2024 showing steady growth from $50k to $120k",
        },
      },
      {
        prompt: "Add a doughnut chart showing budget allocation.",
        arguments: {
          chartType: "doughnut",
          data: [[40, 25, 20, 15]],
          series: ["Budget"],
          categories: ["Marketing", "Development", "Operations", "HR"],
        },
      },
    ],
  });

  func.call = async function (params) {
    Asc.scope.params = params;
    if (params.prompt && !params.data) {
      let requestEngine = AI.Request.create(AI.ActionType.Chat);
      if (!requestEngine) return;
      let isSendedEndLongAction = false;
      async function checkEndAction() {
        if (!isSendedEndLongAction) {
          let actionName =
            "AI" +
            (requestEngine.modelUI && requestEngine.modelUI.name
              ? " (" + requestEngine.modelUI.name + ")"
              : " (Chart Generation)");
          await Asc.Editor.callMethod("EndAction", ["Block", actionName]);
          isSendedEndLongAction = true;
        }
      }
      let actionName =
        "AI" +
        (requestEngine.modelUI && requestEngine.modelUI.name
          ? " (" + requestEngine.modelUI.name + ")"
          : " (Chart Generation)");
      await Asc.Editor.callMethod("StartAction", ["Block", actionName]);
      await Asc.Editor.callMethod("StartAction", ["GroupActions"]);
      try {
        let chartPrompt =
          "Generate chart data for the following request: " +
          params.prompt +
          "\n\nReturn ONLY a JSON object in this exact format (no other text):\n" +
          "{\n" +
          '  "data": [[number, number, ...], [number, number, ...]],\n' +
          '  "series": ["Series1", "Series2", ...],\n' +
          '  "categories": ["Category1", "Category2", ...]\n' +
          "}\n\n" +
          "IMPORTANT RULES:\n" +
          "1. The number of arrays in 'data' MUST equal the number of items in 'series'\n" +
          "2. ALL arrays in 'data' MUST have exactly the same length\n" +
          "3. The number of items in 'categories' MUST equal the length of each data array\n" +
          "Example: if data=[[10,20,30],[40,50,60]], then series must have 2 names and categories must have 3 names";
        let generatedData = await requestEngine.chatRequest(chartPrompt, false);
        await checkEndAction();
        try {
          let parsedData = JSON.parse(generatedData);
          Asc.scope.params.data = parsedData.data;
          Asc.scope.params.series = parsedData.series;
          Asc.scope.params.categories = parsedData.categories;
          let dataLength = Asc.scope.params.data.length;
          let seriesLength = Asc.scope.params.series.length;
          let pointsLength = Asc.scope.params.data[0]
            ? Asc.scope.params.data[0].length
            : 0;
          let categoriesLength = Asc.scope.params.categories.length;
          for (let i = 1; i < Asc.scope.params.data.length; i++) {
            if (Asc.scope.params.data[i].length !== pointsLength) {
              while (Asc.scope.params.data[i].length < pointsLength) {
                Asc.scope.params.data[i].push(0);
              }
              Asc.scope.params.data[i] = Asc.scope.params.data[i].slice(
                0,
                pointsLength
              );
            }
          }
          if (dataLength !== seriesLength) {
            while (Asc.scope.params.series.length < dataLength) {
              Asc.scope.params.series.push(
                "Series " + (Asc.scope.params.series.length + 1)
              );
            }
            Asc.scope.params.series = Asc.scope.params.series.slice(
              0,
              dataLength
            );
          }
          if (pointsLength !== categoriesLength) {
            while (Asc.scope.params.categories.length < pointsLength) {
              Asc.scope.params.categories.push(
                "Cat " + (Asc.scope.params.categories.length + 1)
              );
            }
            Asc.scope.params.categories = Asc.scope.params.categories.slice(
              0,
              pointsLength
            );
          }
        } catch (e) {
          Asc.scope.params.data = [
            [100, 120, 140],
            [90, 110, 130],
          ];
          Asc.scope.params.series = ["Series 1", "Series 2"];
          Asc.scope.params.categories = ["Cat 1", "Cat 2", "Cat 3"];
        }
      } catch (error) {
        await checkEndAction();
        Asc.scope.params.data = [
          [100, 120, 140],
          [90, 110, 130],
        ];
        Asc.scope.params.series = ["Series 1", "Series 2"];
        Asc.scope.params.categories = ["Cat 1", "Cat 2", "Cat 3"];
      }
      await Asc.Editor.callMethod("EndAction", ["GroupActions"]);
    }
    await Asc.Editor.callCommand(function () {
      let presentation = Api.GetPresentation();
      let slide;
      if (Asc.scope.params.slideNumber) {
        slide = presentation.GetSlideByIndex(
          Asc.scope.params.slideNumber - 1
        );
      } else {
        slide = presentation.GetCurrentSlide();
      }
      if (!slide) return;
      let chartType = Asc.scope.params.chartType || "bar3D";
      let data = Asc.scope.params.data || [
        [100, 120, 140],
        [90, 110, 130],
      ];
      let series = Asc.scope.params.series || ["Series 1", "Series 2"];
      let categories = Asc.scope.params.categories || [
        "Category 1",
        "Category 2",
        "Category 3",
      ];
      if (
        !data ||
        data.length === 0 ||
        !data[0] ||
        data[0].length === 0
      ) {
        data = [
          [100, 120, 140],
          [90, 110, 130],
        ];
        series = ["Series 1", "Series 2"];
        categories = ["Category 1", "Category 2", "Category 3"];
      }
      if (data.length > 0 && data[0].length > 0) {
        let dataLength = data.length;
        let pointsLength = data[0].length;
        for (let i = 1; i < data.length; i++) {
          if (data[i].length !== pointsLength) {
            while (data[i].length < pointsLength) {
              data[i].push(0);
            }
            data[i] = data[i].slice(0, pointsLength);
          }
        }
        if (series.length !== dataLength) {
          while (series.length < dataLength) {
            series.push("Series " + (series.length + 1));
          }
          series = series.slice(0, dataLength);
        }
        if (categories.length !== pointsLength) {
          while (categories.length < pointsLength) {
            categories.push("Category " + (categories.length + 1));
          }
          categories = categories.slice(0, pointsLength);
        }
      }
      let slideWidth = presentation.GetWidth();
      let slideHeight = presentation.GetHeight();
      let width = 5472000;
      let height = 3204000;
      let x = (slideWidth - width) / 2;
      let y = (slideHeight - height) / 2;
      let chart = Api.CreateChart(
        chartType,
        data,
        series,
        categories,
        width,
        height,
        24
      );
      if (chart) {
        chart.SetPosition(x, y);
        slide.AddObject(chart);
      }
    });
  };

  return func;
})();