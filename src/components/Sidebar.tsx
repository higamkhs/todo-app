"use client";
import { Box, Flex, Text, IconButton, useColorMode, Spacer, Avatar, Button, Divider, useColorModeValue } from "@chakra-ui/react";
import { MoonIcon, SunIcon, ChevronDownIcon, SettingsIcon, StarIcon, AddIcon, CheckCircleIcon, EditIcon } from "@chakra-ui/icons";
import Link from "next/link";
import { signOut, useSession } from "next-auth/react";
import { Menu, MenuButton, MenuList, MenuItem, List, ListItem, ListIcon, Switch, Progress, Tooltip, Collapse, useDisclosure, Input } from "@chakra-ui/react";
import { useContext, useState } from "react";
import { AppContext } from "../app/providers/AppContextProvider";

export default function Sidebar() {
  const { colorMode, toggleColorMode } = useColorMode();
  const { data: session, status } = useSession();
  const { isOpen, onToggle } = useDisclosure();
  const {
    categories, setCategories, activeCategory, setActiveCategory,
    favoriteIds, pinnedIds, categoryMap
  } = useContext(AppContext);
  const [newCategory, setNewCategory] = useState("");

  // フィルター
  const filters = [
    { label: "すべて", icon: <CheckCircleIcon color="purple.300" /> },
    { label: "未完了", icon: <EditIcon color="yellow.300" /> },
    { label: "完了", icon: <CheckCircleIcon color="green.300" /> },
  ];

  // タスク数・進捗・お気に入りはpropsやcontextで受け取る想定（ここではダミー）
  const allTasks: any[] = typeof window !== 'undefined' ? ((window as any).__ALL_TASKS__ || []) : [];
  const todayTasks = allTasks.filter((t: any) => t.dueDate && new Date(t.dueDate).toDateString() === new Date().toDateString()).length;
  const todayCompleted = allTasks.filter((t: any) => t.dueDate && new Date(t.dueDate).toDateString() === new Date().toDateString() && t.completed).length;
  const completionRate = todayTasks ? Math.round((todayCompleted / todayTasks) * 100) : 0;
  const favoriteTasks = allTasks.filter((t: any) => favoriteIds.includes(t.id));

  // カテゴリ追加
  const handleAddCategory = () => {
    if (newCategory && !categories.includes(newCategory)) {
      setCategories([...categories, newCategory]);
      setNewCategory("");
    }
  };

  return (
    <Box
      w="72"
      h="100vh"
      p={8}
      bgGradient="linear(to-b, #2a133e 0%, #6b21a8 60%, #312e81 100%)"
      _dark={{ bgGradient: "linear(to-b, #1a1027 0%, #4c1d95 60%, #18181b 100%)" }}
      boxShadow="2xl"
      borderRightWidth={0}
      borderRadius="3xl"
      m={0}
      position="relative"
      bg={undefined}
      backdropFilter="blur(16px)"
      display="flex"
      flexDirection="column"
      justifyContent="flex-start"
      alignItems="stretch"
    >
      <Flex align="center" mb={10} gap={3}>
        <Avatar size="md" name={session?.user?.name || session?.user?.email || ''} bg="purple.700" color="white" boxShadow="lg" />
        <Text fontSize="2xl" fontWeight="bold" color="purple.200" fontFamily="heading" letterSpacing="-0.02em">
          Todo SaaS
        </Text>
        <Spacer />
        <IconButton
          aria-label="ダークモード切替"
          icon={colorMode === "light" ? <MoonIcon /> : <SunIcon />}
          onClick={toggleColorMode}
          variant="ghost"
          colorScheme="purple"
          size="md"
        />
      </Flex>
      {/* サマリー */}
      <Box mb={8}>
        <Text fontSize="sm" color="purple.100" mb={1} fontWeight="bold">今日の進捗</Text>
        <Flex align="center" gap={2} mb={1}>
          <CheckCircleIcon color="green.300" />
          <Text fontSize="sm" color="purple.50">{todayCompleted} / {todayTasks} 完了</Text>
        </Flex>
        <Progress value={completionRate} size="xs" colorScheme="purple" borderRadius="xl" />
      </Box>
      {/* フィルター */}
      <Flex gap={2} mb={6}>
        {filters.map((f: any) => (
          <Tooltip label={f.label} key={f.label} hasArrow>
            <IconButton
              aria-label={f.label}
              icon={f.icon}
              colorScheme="purple"
              variant="ghost"
              size="sm"
              borderRadius="full"
              _hover={{ bg: 'purple.600', color: 'white' }}
              m={0}
            />
          </Tooltip>
        ))}
      </Flex>
      {/* カテゴリ切替 */}
      <Menu>
        <MenuButton as={Button} rightIcon={<ChevronDownIcon />} colorScheme="purple" variant="outline" mb={4} w="full" borderRadius="xl">
          {activeCategory}
        </MenuButton>
        <MenuList bg="purple.900" borderColor="purple.700">
          {categories.map((cat: string) => (
            <MenuItem key={cat} _hover={{ bg: 'purple.700', color: 'white' }} onClick={() => setActiveCategory(cat)}>
              {cat}
            </MenuItem>
          ))}
          <MenuItem icon={<AddIcon />} color="purple.200" _hover={{ bg: 'purple.700', color: 'white' }}>
            <Input
              size="sm"
              placeholder="新規カテゴリ名"
              value={newCategory}
              onChange={e => setNewCategory(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') handleAddCategory(); }}
              mr={2}
              bg="purple.800"
              color="white"
              borderRadius="md"
            />
            <Button size="sm" colorScheme="purple" ml={2} onClick={handleAddCategory}>追加</Button>
          </MenuItem>
        </MenuList>
      </Menu>
      {/* お気に入りタスク */}
      <Box mb={4}>
        <Text fontSize="sm" color="purple.100" mb={1} fontWeight="bold">お気に入り</Text>
        <List spacing={1}>
          {favoriteTasks.length === 0 && <ListItem color="purple.300">お気に入りはありません</ListItem>}
          {favoriteTasks.map((t: any) => (
            <ListItem key={t.id}>
              <ListIcon as={StarIcon} color="yellow.300" />{t.title}
            </ListItem>
          ))}
        </List>
      </Box>
      {/* 設定 */}
      <Button leftIcon={<SettingsIcon />} colorScheme="purple" variant="ghost" w="full" mb={2} borderRadius="xl">
        設定
      </Button>
      {/* サイドバー折りたたみ */}
      <Button leftIcon={<ChevronDownIcon />} colorScheme="purple" variant="ghost" w="full" mb={2} borderRadius="xl" onClick={onToggle}>
        サイドバーを{isOpen ? "閉じる" : "開く"}
      </Button>
      <Collapse in={isOpen} animateOpacity>
        <Box p={4} bg="purple.900" borderRadius="xl" mt={2}>
          <Text color="purple.100" fontSize="sm">ここにカスタムウィジェットやTips、通知などを追加できます。</Text>
        </Box>
      </Collapse>
      <Spacer />
      <Divider borderColor={useColorModeValue('purple.100', 'purple.900')} my={8} />
      <Flex direction="column" gap={3} mt="auto" align="center">
        {status === "authenticated" && session?.user ? (
          <>
            <Flex align="center" gap={2}>
              <Avatar size="sm" name={session.user.name || session.user.email || ""} bg="purple.600" color="white" />
              <Text fontSize="sm" color="purple.100" noOfLines={1}>
                {session.user.name || session.user.email}
              </Text>
            </Flex>
            <Button
              mt={2}
              colorScheme="purple"
              variant="solid"
              onClick={() => signOut({ callbackUrl: "/auth/signin" })}
              aria-label="ログアウト"
              w="full"
              borderRadius="xl"
              boxShadow="md"
            >
              ログアウト
            </Button>
          </>
        ) : (
          <Link href="/auth/signin">
            <Button w="full" colorScheme="purple" variant="solid" aria-label="サインイン" borderRadius="xl" boxShadow="md">
              サインイン
            </Button>
          </Link>
        )}
      </Flex>
    </Box>
  );
} 