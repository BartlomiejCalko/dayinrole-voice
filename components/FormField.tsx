import React from 'react'
import { Controller, FieldValues, Path, Control } from "react-hook-form";
import { FormControl, FormDescription, FormItem, FormLabel, FormMessage } from './ui/form';
import { Input } from './ui/input';

interface FormFieldProps<T extends FieldValues> {
  control: Control<T>;
  name: Path<T>;
  label: string;
  placeholder?: string;
  type?: "text" | "email" | "password" | "file";
}

const FormField = <T extends FieldValues>({ control, name, label, placeholder, type = "text" }: FormFieldProps<T>) => (
  <Controller
    name={name}
    control={control}
    render={({ field }) => (
      <FormItem>
        <FormLabel className="text-sm font-medium text-foreground">{label}</FormLabel>
        <FormControl>
          <Input
            className="bg-background/50 border-border/50 focus:border-primary/50 focus:ring-primary/20"
            placeholder={placeholder}
            type={type}
            {...field}
          />
        </FormControl>
        <FormMessage />
      </FormItem>
    )}
  />
);

export default FormField