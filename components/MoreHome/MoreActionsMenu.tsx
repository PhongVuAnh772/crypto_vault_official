// components/MoreActionsMenu.tsx
import React from "react";
import { Pressable } from "react-native";
import {
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuItemIcon,
    DropdownMenuItemTitle,
    DropdownMenuRoot,
    DropdownMenuTrigger,
} from "./dropdown-menu";

export type MoreAction = {
  key: string;
  title: string;
  icon?: React.ReactNode;
  onPress: () => void;
  destructive?: boolean;
  disabled?: boolean;
};

type Props = {
  actions: MoreAction[];
  children: React.ReactNode;
};

export function MoreActionsMenu({ actions, children }: Readonly<Props>) {
  return (
    <DropdownMenuRoot>
      <DropdownMenuTrigger>
        <Pressable>{children}</Pressable>
      </DropdownMenuTrigger>

      <DropdownMenuContent>
        {actions.map((action, index) => (
          <DropdownMenuItem
            key={action.key}
            onSelect={action.onPress}
            destructive={action.destructive}
            disabled={action.disabled}
          >
            {action.icon && (
              <DropdownMenuItemIcon>{action.icon}</DropdownMenuItemIcon>
            )}

            <DropdownMenuItemTitle>{action.title}</DropdownMenuItemTitle>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenuRoot>
  );
}
