import { PeriodNameBuilder } from "src/business/builders/period.name-builder";
import { when } from "jest-when";
import { mockDateParser } from "src/test-helpers/parser.mocks";
import { mockDateParserFactory } from "src/test-helpers/factory.mocks";
import { mockPeriod } from "src/test-helpers/model.mocks";

describe("PeriodNameBuilder", () => {
  let nameBuilder: PeriodNameBuilder;
  let dateParser = mockDateParser;

  const nameTemplate = "yyyy-MM-dd";
  const period = mockPeriod;

  beforeEach(() => {
    const dateParserFactory = mockDateParserFactory(dateParser);

    nameBuilder = new PeriodNameBuilder(dateParserFactory);
  });

  describe("build", () => {
    it("should build a name with the provided template, value, and path", () => {
      // Arrange
      const path = "/daily-notes";

      when(dateParser.fromDate)
        .calledWith(period.date, path)
        .mockReturnValue(path)
        .calledWith(period.date, nameTemplate)
        .mockReturnValue("2023-10-02.md");

      // Act
      const result = nameBuilder
        .withPath(path)
        .withName(nameTemplate)
        .withValue(period)
        .build();

      // Assert
      expect(dateParser.fromDate).toHaveBeenCalledWith(period.date, path);
      expect(dateParser.fromDate).toHaveBeenCalledWith(
        period.date,
        nameTemplate
      );
      expect(result).toBe("/daily-notes/2023-10-02.md");
    });

    it("should build a name without the path if it is not provided", () => {
      // Arrange
      when(dateParser.fromDate)
        .calledWith(period.date, "")
        .mockReturnValue("")
        .calledWith(period.date, nameTemplate)
        .mockReturnValue("2023-10-02.md");

      // Act
      const result = nameBuilder
        .withName(nameTemplate)
        .withValue(period)
        .build();

      // Assert
      expect(dateParser.fromDate).toHaveBeenCalledWith(period.date, "");
      expect(dateParser.fromDate).toHaveBeenCalledWith(
        period.date,
        nameTemplate
      );
      expect(result).toBe("2023-10-02.md");
    });

    it("should throw an error if the period is not provided", () => {
      // Act
      const result = () => nameBuilder.withName(nameTemplate).build();

      // Assert
      expect(() => result()).toThrow(
        "Could not create the note name: Period is required!"
      );
    });

    it("should throw an error if the name template is not provided", () => {
      // Act
      const result = () => nameBuilder.withValue(period).build();

      // Assert
      expect(() => result()).toThrow(
        "Could not create the note name: Name template is required!"
      );
    });

    it("should use literal folder name as-is when it contains apostrophes", () => {
      // Arrange
      const pathWithApostrophe = "Steve's Brain";

      when(dateParser.fromDate)
        .calledWith(period.date, nameTemplate)
        .mockReturnValue("2023-10-02.md");

      // Act
      const result = nameBuilder
        .withPath(pathWithApostrophe)
        .withName(nameTemplate)
        .withValue(period)
        .build();

      // Assert
      expect(dateParser.fromDate).not.toHaveBeenCalledWith(
        period.date,
        pathWithApostrophe
      );
      expect(dateParser.fromDate).toHaveBeenCalledWith(
        period.date,
        nameTemplate
      );
      expect(result).toBe("Steve's Brain/2023-10-02.md");
    });

    it("should use literal folder name as-is when it does not contain date format tokens", () => {
      // Arrange
      const literalPath = "Daily notes";

      when(dateParser.fromDate)
        .calledWith(period.date, nameTemplate)
        .mockReturnValue("2023-10-02.md");

      // Act
      const result = nameBuilder
        .withPath(literalPath)
        .withName(nameTemplate)
        .withValue(period)
        .build();

      // Assert
      expect(dateParser.fromDate).not.toHaveBeenCalledWith(
        period.date,
        literalPath
      );
      expect(dateParser.fromDate).toHaveBeenCalledWith(
        period.date,
        nameTemplate
      );
      expect(result).toBe("Daily notes/2023-10-02.md");
    });

    it("should parse folder path as date template when it contains date format tokens", () => {
      // Arrange
      const dateTemplatePath = "yyyy-'Daily notes'";
      const formattedPath = "2023-Daily notes";

      when(dateParser.fromDate)
        .calledWith(period.date, dateTemplatePath)
        .mockReturnValue(formattedPath)
        .calledWith(period.date, nameTemplate)
        .mockReturnValue("2023-10-02.md");

      // Act
      const result = nameBuilder
        .withPath(dateTemplatePath)
        .withName(nameTemplate)
        .withValue(period)
        .build();

      // Assert
      expect(dateParser.fromDate).toHaveBeenCalledWith(
        period.date,
        dateTemplatePath
      );
      expect(dateParser.fromDate).toHaveBeenCalledWith(
        period.date,
        nameTemplate
      );
      expect(result).toBe("2023-Daily notes/2023-10-02.md");
    });

    it("should parse folder path with date format tokens like yyyy/MM/dd", () => {
      // Arrange
      const dateTemplatePath = "yyyy/MM/dd";
      const formattedPath = "2023/10/02";

      when(dateParser.fromDate)
        .calledWith(period.date, dateTemplatePath)
        .mockReturnValue(formattedPath)
        .calledWith(period.date, nameTemplate)
        .mockReturnValue("2023-10-02.md");

      // Act
      const result = nameBuilder
        .withPath(dateTemplatePath)
        .withName(nameTemplate)
        .withValue(period)
        .build();

      // Assert
      expect(dateParser.fromDate).toHaveBeenCalledWith(
        period.date,
        dateTemplatePath
      );
      expect(dateParser.fromDate).toHaveBeenCalledWith(
        period.date,
        nameTemplate
      );
      expect(result).toBe("2023/10/02/2023-10-02.md");
    });
  });
});
