import {
  registerDecorator,
  ValidationOptions,
  ValidationArguments,
} from 'class-validator';

export function MatchPasswords(
  property: string,
  validationOptions?: ValidationOptions,
) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: 'matchPasswords',
      target: object.constructor,
      propertyName: propertyName,
      constraints: [property],
      options: validationOptions,
      validator: {
        validate(value: any, args: ValidationArguments) {
          const relatedPropertyName = args.constraints?.[0] as string;
          if (!relatedPropertyName) return false;

          const relatedValue = (args.object as Record<string, any>)[
            relatedPropertyName
          ] as string;
          return (
            typeof value === 'string' &&
            typeof relatedValue === 'string' &&
            value === relatedValue
          );
        },
        defaultMessage(args: ValidationArguments) {
          const relatedPropertyName = args.constraints?.[0] as string;
          return `${propertyName} must match ${relatedPropertyName}`;
        },
      },
    });
  };
}
