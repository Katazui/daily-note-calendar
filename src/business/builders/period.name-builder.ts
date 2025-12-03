import {NameBuilder} from 'src/business/contracts/name-builder';
import {DateParser} from 'src/infrastructure/contracts/date-parser';
import {Period} from 'src/domain/models/period.model';
import {DateParserFactory} from 'src/infrastructure/contracts/date-parser-factory';
import 'src/extensions/extensions';

export class PeriodNameBuilder implements NameBuilder<Period> {
  private readonly dateParser: DateParser;

  private period?: Period;
  private pathTemplate?: string;
  private nameTemplate?: string;

  constructor(dateParserFactory: DateParserFactory) {
    this.dateParser = dateParserFactory.getParser();
  }

  // Fix: 2025-12-03 - Detects date format tokens to distinguish templates from literal folder names
  private containsDateFormatTokens(template: string): boolean {
    if (!template || template.length === 0) {
      return false;
    }

    // Common date-fns format tokens: year, month, day, hour, minute, second, week, quarter, day of week
    const dateTokenPattern =
      /\b(yyyy|yy|MM|M|dd|d|HH|H|mm|m|ss|s|ww|w|qqq|q|EEEE|EEE|eeee|eee)\b/;
    return dateTokenPattern.test(template);
  }

  public withPath(template: string): NameBuilder<Period> {
    this.pathTemplate = template;
    return this;
  }

  public withName(template: string): NameBuilder<Period> {
    this.nameTemplate = template;
    return this;
  }

  public withValue(value: Period): NameBuilder<Period> {
    this.period = value;
    return this;
  }

  public build(): string {
    if (!this.period) {
      throw Error("Could not create the note name: Period is required!");
    } else if (!this.nameTemplate) {
      throw Error("Could not create the note name: Name template is required!");
    }

    // Fix: 2025-12-03 - Skip date parsing for literal folder names to prevent apostrophe bug
    const pathTemplate = this.pathTemplate ?? "";
    const path = this.containsDateFormatTokens(pathTemplate)
      ? this.dateParser.fromDate(this.period.date, pathTemplate)
      : pathTemplate;

    const name = this.dateParser
      .fromDate(this.period.date, this.nameTemplate)
      .appendMarkdownExtension();

    if (path.length === 0) {
      return name;
    }

    return [path, name].join("/");
  }
}
