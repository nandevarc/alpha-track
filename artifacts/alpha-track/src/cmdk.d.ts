declare module 'cmdk' {
  import * as React from 'react';

  interface CommandProps extends React.HTMLAttributes<HTMLDivElement> {
    label?: string;
    shouldFilter?: boolean;
    filter?: (value: string, search: string) => number;
    value?: string;
    onValueChange?: (value: string) => void;
    loop?: boolean;
  }
  interface CommandInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    onValueChange?: (value: string) => void;
  }
  interface CommandListProps extends React.HTMLAttributes<HTMLDivElement> {}
  interface CommandItemProps extends React.HTMLAttributes<HTMLDivElement> {
    value?: string;
    disabled?: boolean;
    onSelect?: (value: string) => void;
    keywords?: string[];
  }
  interface CommandGroupProps extends React.HTMLAttributes<HTMLDivElement> {
    heading?: React.ReactNode;
    value?: string;
  }
  interface CommandSeparatorProps extends React.HTMLAttributes<HTMLDivElement> {
    alwaysRender?: boolean;
  }
  interface CommandEmptyProps extends React.HTMLAttributes<HTMLDivElement> {}

  const Command: React.ForwardRefExoticComponent<CommandProps & React.RefAttributes<HTMLDivElement>> & {
    displayName?: string;
    Input: React.ForwardRefExoticComponent<CommandInputProps & React.RefAttributes<HTMLInputElement>> & { displayName?: string };
    List: React.ForwardRefExoticComponent<CommandListProps & React.RefAttributes<HTMLDivElement>> & { displayName?: string };
    Item: React.ForwardRefExoticComponent<CommandItemProps & React.RefAttributes<HTMLDivElement>> & { displayName?: string };
    Group: React.ForwardRefExoticComponent<CommandGroupProps & React.RefAttributes<HTMLDivElement>> & { displayName?: string };
    Separator: React.ForwardRefExoticComponent<CommandSeparatorProps & React.RefAttributes<HTMLDivElement>> & { displayName?: string };
    Empty: React.ForwardRefExoticComponent<CommandEmptyProps & React.RefAttributes<HTMLDivElement>> & { displayName?: string };
  };

  export { Command };
}
