import type { Meta, StoryObj } from '@storybook/react';
import * as React from 'react';
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from './NavigationMenu';
import { cn } from '@/lib/ui-utils';

const meta: Meta<typeof NavigationMenu> = {
  title: 'UI/NavigationMenu',
  component: NavigationMenu,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

const ListItem = React.forwardRef<
  React.ElementRef<'a'>,
  React.ComponentPropsWithoutRef<'a'> & { title: string }
>(({ className, title, children, ...props }, ref) => {
  return (
    <li>
      <NavigationMenuLink asChild>
        <a
          ref={ref}
          className={cn(
            'block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-gray-100 hover:text-gray-900 focus:bg-gray-100 focus:text-gray-900',
            className
          )}
          {...props}
        >
          <div className="text-sm font-medium leading-none">{title}</div>
          <p className="line-clamp-2 text-sm leading-snug text-gray-600">
            {children}
          </p>
        </a>
      </NavigationMenuLink>
    </li>
  );
});
ListItem.displayName = 'ListItem';

export const Default: Story = {
  render: () => (
    <NavigationMenu>
      <NavigationMenuList>
        <NavigationMenuItem>
          <NavigationMenuTrigger>ミッション管理</NavigationMenuTrigger>
          <NavigationMenuContent>
            <ul className="grid gap-3 p-6 md:w-[400px] lg:w-[500px] lg:grid-cols-[.75fr_1fr]">
              <li className="row-span-3">
                <NavigationMenuLink asChild>
                  <a
                    className="flex h-full w-full select-none flex-col justify-end rounded-md bg-gradient-to-b from-blue-500/20 to-blue-700/20 p-6 no-underline outline-none focus:shadow-md"
                    href="/"
                  >
                    <div className="mb-2 mt-4 text-lg font-medium">
                      ダッシュボード
                    </div>
                    <p className="text-sm leading-tight text-gray-600">
                      今日のミッション進捗と統計を確認できます
                    </p>
                  </a>
                </NavigationMenuLink>
              </li>
              <ListItem href="/missions" title="ミッション一覧">
                すべてのミッションを管理・編集できます
              </ListItem>
              <ListItem href="/calendar" title="カレンダー">
                月間の実行記録をカレンダー形式で確認
              </ListItem>
              <ListItem href="/statistics" title="統計レポート">
                詳細な進捗分析と達成率レポート
              </ListItem>
            </ul>
          </NavigationMenuContent>
        </NavigationMenuItem>
        <NavigationMenuItem>
          <NavigationMenuTrigger>カテゴリ</NavigationMenuTrigger>
          <NavigationMenuContent>
            <ul className="grid w-[400px] gap-3 p-4 md:w-[500px] md:grid-cols-2 lg:w-[600px]">
              <ListItem
                title="健康管理"
                href="/category/health"
              >
                運動、食事、睡眠などの健康に関するミッション
              </ListItem>
              <ListItem
                title="勉強・学習"
                href="/category/study"
              >
                スキルアップや資格取得のためのミッション
              </ListItem>
              <ListItem
                title="仕事・キャリア"
                href="/category/work"
              >
                業務効率化やキャリア開発のミッション
              </ListItem>
              <ListItem
                title="趣味・娯楽"
                href="/category/hobby"
              >
                リフレッシュや創作活動のミッション
              </ListItem>
              <ListItem
                title="家事・生活"
                href="/category/life"
              >
                日常生活の質を向上させるミッション
              </ListItem>
              <ListItem
                title="人間関係"
                href="/category/relationship"
              >
                コミュニケーションや人とのつながりに関するミッション
              </ListItem>
            </ul>
          </NavigationMenuContent>
        </NavigationMenuItem>
        <NavigationMenuItem>
          <NavigationMenuLink
            href="/settings"
            className={cn(navigationMenuTriggerStyle())}
          >
            設定
          </NavigationMenuLink>
        </NavigationMenuItem>
      </NavigationMenuList>
    </NavigationMenu>
  ),
};

export const SimpleMenu: Story = {
  render: () => (
    <NavigationMenu>
      <NavigationMenuList>
        <NavigationMenuItem>
          <NavigationMenuLink
            href="/"
            className={cn(navigationMenuTriggerStyle())}
          >
            ホーム
          </NavigationMenuLink>
        </NavigationMenuItem>
        <NavigationMenuItem>
          <NavigationMenuTrigger>ミッション</NavigationMenuTrigger>
          <NavigationMenuContent>
            <ul className="grid gap-3 p-4 md:w-[400px]">
              <ListItem
                title="新規作成"
                href="/missions/new"
              >
                新しいミッションを作成します
              </ListItem>
              <ListItem
                title="編集・管理"
                href="/missions"
              >
                既存のミッションを編集・削除します
              </ListItem>
            </ul>
          </NavigationMenuContent>
        </NavigationMenuItem>
        <NavigationMenuItem>
          <NavigationMenuLink
            href="/statistics"
            className={cn(navigationMenuTriggerStyle())}
          >
            統計
          </NavigationMenuLink>
        </NavigationMenuItem>
      </NavigationMenuList>
    </NavigationMenu>
  ),
};