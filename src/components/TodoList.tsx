'use client';

import { useState, useEffect, useRef, useContext } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import {
  Box,
  Card,
  CardBody,
  CardHeader,
  Stack,
  StackDivider,
  Flex,
  Text,
  Input,
  InputGroup,
  InputRightElement,
  IconButton,
  Checkbox,
  Badge,
  Avatar,
  useColorMode,
  useTheme,
  useColorModeValue,
  Tooltip,
  Skeleton,
  Progress,
  Image,
  Tag,
  TagLabel,
  TagLeftIcon,
  Select,
  useToast,
  Collapse,
  CheckboxGroup,
  Checkbox as CkBox,
  Button,
} from "@chakra-ui/react";
import { AddIcon, DeleteIcon, EditIcon, CheckIcon, MoonIcon, SunIcon, InfoOutlineIcon, StarIcon } from "@chakra-ui/icons";
import { AppContext } from "../app/providers/AppContextProvider";

interface SubTask {
  id: number;
  title: string;
  completed: boolean;
}

interface Todo {
  id: number;
  title: string;
  completed: boolean;
  createdAt: string;
  updatedAt: string;
  priority?: "high" | "medium" | "low";
  dueDate?: string;
  description?: string;
  pinned?: boolean;
  color?: string;
  subTasks?: SubTask[];
}

function formatDate(dateStr: string) {
  const date = new Date(dateStr);
  return `${date.getFullYear()}/${(date.getMonth()+1).toString().padStart(2,'0')}/${date.getDate().toString().padStart(2,'0')} ${date.getHours().toString().padStart(2,'0')}:${date.getMinutes().toString().padStart(2,'0')}`;
}

export default function TodoList() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [todos, setTodos] = useState<Todo[]>([]);
  const [newTodo, setNewTodo] = useState('');
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState<number|null>(null);
  const [editingTitle, setEditingTitle] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const { colorMode } = useColorMode();
  const theme = useTheme();
  const cardBg = useColorModeValue("white", "gray.800");
  const cardShadow = useColorModeValue("xl", "dark-lg");
  const inputBg = useColorModeValue("gray.100", "gray.700");
  const badgeColor = (completed: boolean) => (completed ? "green" : "yellow");
  const badgeText = (completed: boolean) => (completed ? "完了" : "未完了");
  const [search, setSearch] = useState("");
  const [showDetailId, setShowDetailId] = useState<number | null>(null);
  const toast = useToast();
  const appCtx = useContext(AppContext);
  const {
    categories, setCategories, activeCategory, setActiveCategory,
    favoriteIds, setFavoriteIds, pinnedIds, setPinnedIds, categoryMap, setCategoryMap
  } = appCtx;
  const [newSubTask, setNewSubTask] = useState("");
  const [editingSubTask, setEditingSubTask] = useState<{ todoId: number, subId: number, value: string } | null>(null);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.replace('/auth/signin');
    } else if (status === 'authenticated') {
      fetchTodos();
    }
    // eslint-disable-next-line
  }, [status]);

  const fetchTodos = async () => {
    setLoading(true);
    const response = await fetch('/api/todos');
    const data = await response.json();
    if (Array.isArray(data)) {
      // 完了タスクは下に
      data.sort((a: Todo, b: Todo) => Number(a.completed) - Number(b.completed));
      setTodos(data);
    } else {
      setTodos([]);
      // 必要ならエラーメッセージも表示
      // setError(data.error || "タスクの取得に失敗しました");
    }
    setLoading(false);
  };

  const addTodo = async () => {
    if (newTodo.trim()) {
      setLoading(true);
      await fetch('/api/todos', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ title: newTodo }),
      });
      setNewTodo('');
      fetchTodos();
      inputRef.current?.focus();
    }
  };

  const toggleTodo = async (id: number) => {
    const todo = todos.find(t => t.id === id);
    if (todo) {
      setLoading(true);
      await fetch(`/api/todos/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ completed: !todo.completed }),
      });
      fetchTodos();
    }
  };

  const deleteTodo = async (id: number) => {
    setLoading(true);
    await fetch(`/api/todos/${id}`, {
      method: 'DELETE',
    });
    fetchTodos();
  };

  // タスク編集
  const startEdit = (id: number, title: string) => {
    setEditingId(id);
    setEditingTitle(title);
  };
  const saveEdit = async (id: number) => {
    if (editingTitle.trim()) {
      setLoading(true);
      await fetch(`/api/todos/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ title: editingTitle }),
      });
      setEditingId(null);
      setEditingTitle('');
      fetchTodos();
    }
  };

  // ドラッグ＆ドロップ
  const onDragEnd = (result: DropResult) => {
    if (!result.destination) return;
    const items = Array.from(todos);
    const [reordered] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reordered);
    setTodos(items);
  };

  const activeCount = todos.filter(t => !t.completed).length;

  // 仮データ: 優先度・期日・説明・サブタスク・ピン・色
  // 本来はAPIで管理
  const enrichTodo = (todo: Todo, idx: number): Todo => ({
    ...todo,
    priority: ["high", "medium", "low"][idx % 3] as "high" | "medium" | "low",
    dueDate: new Date(Date.now() + (idx % 5) * 86400000).toISOString(),
    description: `これは「${todo.title}」の詳細説明です。` + (idx % 2 === 0 ? "\nサブタスクもあります。" : ""),
    pinned: idx % 4 === 0,
    color: ["purple.400", "blue.400", "green.400", "orange.400"][idx % 4],
    subTasks: idx % 2 === 0 ? [
      { id: 1, title: "サブタスクA", completed: idx % 3 === 0 },
      { id: 2, title: "サブタスクB", completed: false },
    ] : [],
  });
  const enrichedTodos = todos.map(enrichTodo)
    .filter(todo => todo.title.includes(search));
  const pinnedTodos = enrichedTodos.filter(t => t.pinned);
  const normalTodos = enrichedTodos.filter(t => !t.pinned);
  const allSubTasks = enrichedTodos.flatMap(t => t.subTasks || []);
  const subTaskTotal = allSubTasks.length;
  const subTaskDone = allSubTasks.filter(st => st.completed).length;
  const progress = enrichedTodos.length ? Math.round((enrichedTodos.filter(t => t.completed).length / enrichedTodos.length) * 100) : 0;

  // enrichedTodosのカテゴリ・ピン・お気に入り・フィルタ連動
  const filteredTodos = enrichedTodos.filter(t =>
    (activeCategory === "すべて" || categoryMap[t.id] === activeCategory)
  );
  const pinnedTodosFiltered = filteredTodos.filter(t => pinnedIds.includes(t.id));
  const normalTodosFiltered = filteredTodos.filter(t => !pinnedIds.includes(t.id));

  // タスクのピン止め
  const togglePin = (id: number) => {
    setPinnedIds((prev: number[]) => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };
  // タスクのお気に入り
  const toggleFavorite = (id: number) => {
    setFavoriteIds((prev: number[]) => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };
  // タスクのカテゴリ変更
  const changeCategory = (id: number, cat: string) => {
    setCategoryMap((prev: any) => ({ ...prev, [id]: cat }));
  };
  // サブタスク追加
  const addSubTask = (todo: Todo) => {
    if (!newSubTask.trim()) return;
    todo.subTasks = todo.subTasks || [];
    todo.subTasks.push({ id: Date.now(), title: newSubTask, completed: false });
    setNewSubTask("");
  };
  // サブタスク編集
  const startEditSubTask = (todoId: number, subId: number, value: string) => {
    setEditingSubTask({ todoId, subId, value });
  };
  const saveEditSubTask = (todo: Todo, subId: number) => {
    if (!editingSubTask?.value.trim()) return;
    todo.subTasks = (todo.subTasks || []).map(st => st.id === subId ? { ...st, title: editingSubTask.value } : st);
    setEditingSubTask(null);
  };
  // サブタスク削除
  const deleteSubTask = (todo: Todo, subId: number) => {
    todo.subTasks = (todo.subTasks || []).filter(st => st.id !== subId);
    setEditingSubTask(null);
  };

  if (status === 'loading') {
    return <div className="text-center py-20 text-lg text-gray-500 dark:text-gray-300">認証確認中...</div>;
  }

  return (
    <Box minH="100vh" py={6} px={8} bgGradient="linear(to-br, #2a133e 0%, #6b21a8 60%, #312e81 100%)" _dark={{ bgGradient: "linear(to-br, #1a1027 0%, #4c1d95 60%, #18181b 100%)" }} transition="all 0.5s">
      <Card width="100%" maxWidth="none" p={8} borderRadius="3xl" boxShadow="2xl" bg={useColorModeValue('whiteAlpha.700', 'whiteAlpha.100')} backdropFilter="blur(12px)" _dark={{ bg: 'whiteAlpha.100' }}>
        <CardHeader pb={4}>
          <Flex align="center" justify="flex-start" gap={4}>
            <Avatar bg="purple.700" icon={<MoonIcon fontSize="2xl" color="white" />} size="lg" boxShadow="lg" />
            <Text fontSize="3xl" fontWeight="extrabold" color="purple.400" letterSpacing="-0.03em" fontFamily="heading" textShadow="0 2px 8px #0002">
              Todoリスト
            </Text>
          </Flex>
        </CardHeader>
        <CardBody>
          <Stack spacing={6} width="100%">
            {/* 検索バー・進捗バー */}
            <Flex gap={2} align="center" width="100%">
              <Input
                placeholder="タスク検索..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                bg={useColorModeValue('whiteAlpha.800', 'whiteAlpha.200')}
                borderRadius="xl"
                fontWeight={500}
                fontSize="md"
                shadow="md"
                color={useColorModeValue('gray.900', 'white')}
                backdropFilter="blur(6px)"
                width="40%"
                minWidth="200px"
                maxWidth="400px"
              />
              <Progress value={progress} size="sm" colorScheme="purple" borderRadius="xl" flex={1} ml={2} />
              <Tooltip label={`全体進捗: ${progress}%`} hasArrow>
                <InfoOutlineIcon color="purple.400" ml={2} />
              </Tooltip>
            </Flex>
            <InputGroup size="lg">
              <Input
                ref={inputRef}
                type="text"
                value={newTodo}
                onChange={(e) => setNewTodo(e.target.value)}
                bg={useColorModeValue('whiteAlpha.800', 'whiteAlpha.200')}
                fontWeight={500}
                fontSize="lg"
                placeholder="新しいタスクを入力"
                onKeyDown={e => { if (e.key === 'Enter') addTodo(); }}
                disabled={loading}
                aria-label="新しいタスクを入力"
                autoFocus
                borderRadius="2xl"
                shadow="md"
                color={useColorModeValue('gray.900', 'white')}
                backdropFilter="blur(6px)"
              />
              <InputRightElement width="4.5rem">
                <Tooltip label="追加" hasArrow>
                  <IconButton
                    colorScheme="purple"
                    aria-label="追加"
                    icon={<AddIcon />}
                    onClick={() => {
                      addTodo();
                      toast({ title: "タスク追加", description: "新しいタスクを追加しました", status: "success", duration: 2000, isClosable: true });
                    }}
                    isLoading={loading}
                    borderRadius="xl"
                    boxShadow="md"
                  />
                </Tooltip>
              </InputRightElement>
            </InputGroup>
            <Flex justify="space-between" align="center">
              <Text fontSize="sm" color={useColorModeValue('gray.200', 'gray.300')}>
                アクティブ: <Text as="span" fontWeight="bold" color="purple.200">{activeCount}</Text> / 全{todos.length}
              </Text>
              <Text fontSize="xs" color={useColorModeValue('gray.300', 'gray.400')}>ドラッグで並び替え・ダブルクリックで編集</Text>
            </Flex>
            {loading && <Progress size="xs" isIndeterminate colorScheme="purple" borderRadius="xl" />}
            {enrichedTodos.length === 0 && !loading && (
              <Box textAlign="center" color={useColorModeValue('gray.300', 'gray.500')} py={12} fontSize="lg" fontWeight="medium">
                タスクがありません。新しいタスクを追加しましょう！
              </Box>
            )}
            {/* ピン留めタスク */}
            {pinnedTodosFiltered.length > 0 && (
              <Box mb={2}>
                <Text fontSize="sm" color="purple.300" fontWeight="bold" mb={1}>ピン留め</Text>
                <Stack spacing={3}>
                  {pinnedTodosFiltered.map((todo, idx) => (
                    <Card key={todo.id} p={3} borderRadius="xl" boxShadow="lg" bg={todo.color} opacity={todo.completed ? 0.5 : 1}>
                      <Flex align="center" gap={2}>
                        <IconButton aria-label="ピン" icon={<StarIcon />} colorScheme={pinnedIds.includes(todo.id) ? "yellow" : "gray"} variant="ghost" onClick={() => togglePin(todo.id)} />
                        <IconButton aria-label="お気に入り" icon={<CheckIcon />} colorScheme={favoriteIds.includes(todo.id) ? "pink" : "gray"} variant="ghost" onClick={() => toggleFavorite(todo.id)} />
                        <Text fontWeight="bold" color="white" flex={1}>{todo.title}</Text>
                        <Badge colorScheme="purple">{badgeText(todo.completed)}</Badge>
                        <Select size="sm" w="auto" value={categoryMap[todo.id] || "すべて"} onChange={e => changeCategory(todo.id, e.target.value)} bg="purple.100" color="purple.900" borderRadius="md" ml={2}>
                          {categories.map((cat: string) => <option key={cat} value={cat}>{cat}</option>)}
                        </Select>
                        <Tooltip label="詳細" hasArrow>
                          <IconButton aria-label="詳細" icon={<InfoOutlineIcon />} size="sm" onClick={() => setShowDetailId(todo.id === showDetailId ? null : todo.id)} />
                        </Tooltip>
                      </Flex>
                      <Collapse in={showDetailId === todo.id} animateOpacity>
                        <Box mt={2} p={2} bg="whiteAlpha.800" borderRadius="md" color="gray.800">
                          <Text fontSize="sm" fontWeight="bold">説明: {todo.description}</Text>
                          <Text fontSize="sm">期日: {todo.dueDate ? formatDate(todo.dueDate) : "未設定"}</Text>
                          <Tag colorScheme={todo.priority === "high" ? "red" : todo.priority === "medium" ? "yellow" : "blue"} mr={2}>
                            <TagLabel>{todo.priority === "high" ? "高" : todo.priority === "medium" ? "中" : "低"}優先度</TagLabel>
                          </Tag>
                          {/* サブタスク編集 */}
                          <Box mt={2}>
                            <Text fontSize="xs" color="gray.600">サブタスク</Text>
                            <Stack direction="row" align="center" mb={2}>
                              <Input size="sm" placeholder="サブタスク追加" value={newSubTask} onChange={e => setNewSubTask(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') addSubTask(todo); }} />
                              <Button size="sm" colorScheme="purple" onClick={() => addSubTask(todo)}>追加</Button>
                            </Stack>
                            <CheckboxGroup colorScheme="purple" defaultValue={todo.subTasks?.filter(st => st.completed).map(st => st.id.toString())}>
                              <Stack>
                                {todo.subTasks?.map(st => (
                                  <Flex key={st.id} align="center" gap={2}>
                                    {editingSubTask && editingSubTask.todoId === todo.id && editingSubTask.subId === st.id ? (
                                      <Input size="sm" value={editingSubTask.value} onChange={e => setEditingSubTask({ ...editingSubTask, value: e.target.value })} onBlur={() => saveEditSubTask(todo, st.id)} onKeyDown={e => { if (e.key === 'Enter') saveEditSubTask(todo, st.id); if (e.key === 'Escape') setEditingSubTask(null); }} autoFocus />
                                    ) : (
                                      <Text fontSize="sm" flex={1} onDoubleClick={() => startEditSubTask(todo.id, st.id, st.title)}>{st.title}</Text>
                                    )}
                                    <IconButton aria-label="編集" icon={<EditIcon />} size="xs" variant="ghost" onClick={() => startEditSubTask(todo.id, st.id, st.title)} />
                                    <IconButton aria-label="削除" icon={<DeleteIcon />} size="xs" variant="ghost" colorScheme="red" onClick={() => deleteSubTask(todo, st.id)} />
                                  </Flex>
                                ))}
                              </Stack>
                            </CheckboxGroup>
                          </Box>
                        </Box>
                      </Collapse>
                    </Card>
                  ))}
                </Stack>
              </Box>
            )}
            {/* 通常タスク */}
            <DragDropContext onDragEnd={onDragEnd}>
              <Droppable droppableId="todo-list">
                {(provided) => (
                  <Stack
                    spacing={5}
                    divider={<StackDivider borderColor={useColorModeValue("purple.100", "purple.900")} />}
                    {...provided.droppableProps}
                    ref={provided.innerRef}
                  >
                    {normalTodosFiltered.map((todo, idx) => (
                      <Draggable key={todo.id} draggableId={todo.id.toString()} index={idx}>
                        {(provided, snapshot) => (
                          <Card
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            p={4}
                            borderRadius="2xl"
                            boxShadow={snapshot.isDragging ? "2xl" : "xl"}
                            bg={useColorModeValue('whiteAlpha.800', 'whiteAlpha.100')}
                            opacity={todo.completed ? 0.6 : 1}
                            transform={snapshot.isDragging ? "scale(1.03)" : undefined}
                            transition="all 0.2s"
                            backdropFilter="blur(8px)"
                          >
                            <Flex align="center" gap={4}>
                              <Checkbox
                                isChecked={todo.completed}
                                onChange={() => toggleTodo(todo.id)}
                                colorScheme="purple"
                                size="lg"
                                mr={2}
                                aria-label="完了にする"
                                isDisabled={loading}
                              />
                              <IconButton aria-label="ピン" icon={<StarIcon />} colorScheme={pinnedIds.includes(todo.id) ? "yellow" : "gray"} variant="ghost" onClick={() => togglePin(todo.id)} />
                              <IconButton aria-label="お気に入り" icon={<CheckIcon />} colorScheme={favoriteIds.includes(todo.id) ? "pink" : "gray"} variant="ghost" onClick={() => toggleFavorite(todo.id)} />
                              {editingId === todo.id ? (
                                <Input
                                  value={editingTitle}
                                  onChange={e => setEditingTitle(e.target.value)}
                                  onBlur={() => saveEdit(todo.id)}
                                  onKeyDown={e => { if (e.key === 'Enter') saveEdit(todo.id); if (e.key === 'Escape') { setEditingId(null); setEditingTitle(''); }}}
                                  fontSize="lg"
                                  fontWeight="semibold"
                                  bg={useColorModeValue('whiteAlpha.700', 'whiteAlpha.200')}
                                  borderRadius="md"
                                  autoFocus
                                  color={useColorModeValue('gray.900', 'white')}
                                  backdropFilter="blur(4px)"
                                />
                              ) : (
                                <Text
                                  fontSize="lg"
                                  fontWeight="semibold"
                                  color={todo.completed ? "gray.400" : useColorModeValue('gray.800', 'white')}
                                  textDecoration={todo.completed ? "line-through" : undefined}
                                  cursor="pointer"
                                  onDoubleClick={() => startEdit(todo.id, todo.title)}
                                  noOfLines={1}
                                  flex={1}
                                  textShadow="0 1px 4px #0002"
                                >
                                  {todo.title}
                                </Text>
                              )}
                              <Tag colorScheme={todo.priority === "high" ? "red" : todo.priority === "medium" ? "yellow" : "blue"} mr={2}>
                                <TagLabel>{todo.priority === "high" ? "高" : todo.priority === "medium" ? "中" : "低"}</TagLabel>
                              </Tag>
                              <Badge colorScheme={todo.completed ? "purple" : "gray"} fontSize="0.9em" px={3} py={1} borderRadius="md" boxShadow="md">
                                {badgeText(todo.completed)}
                              </Badge>
                              <Text fontSize="xs" color={useColorModeValue('gray.400', 'gray.500')} fontFamily="mono" pl={2} whiteSpace="nowrap">
                                {todo.dueDate ? formatDate(todo.dueDate) : "期日なし"}
                              </Text>
                              <Select size="sm" w="auto" value={categoryMap[todo.id] || "すべて"} onChange={e => changeCategory(todo.id, e.target.value)} bg="purple.100" color="purple.900" borderRadius="md" ml={2}>
                                {categories.map((cat: string) => <option key={cat} value={cat}>{cat}</option>)}
                              </Select>
                              <Tooltip label="詳細" hasArrow>
                                <IconButton aria-label="詳細" icon={<InfoOutlineIcon />} size="sm" onClick={() => setShowDetailId(todo.id === showDetailId ? null : todo.id)} />
                              </Tooltip>
                              <Tooltip label="削除" hasArrow>
                                <IconButton
                                  aria-label="削除"
                                  icon={<DeleteIcon />}
                                  colorScheme="purple"
                                  variant="ghost"
                                  onClick={() => {
                                    deleteTodo(todo.id);
                                    toast({ title: "タスク削除", description: "タスクを削除しました", status: "info", duration: 2000, isClosable: true });
                                  }}
                                  isDisabled={loading}
                                  borderRadius="full"
                                  ml={2}
                                  boxShadow="md"
                                />
                              </Tooltip>
                            </Flex>
                            {/* 詳細パネル */}
                            <Collapse in={showDetailId === todo.id} animateOpacity>
                              <Box mt={2} p={2} bg="whiteAlpha.800" borderRadius="md" color="gray.800">
                                <Text fontSize="sm" fontWeight="bold">説明: {todo.description}</Text>
                                <Text fontSize="sm">期日: {todo.dueDate ? formatDate(todo.dueDate) : "未設定"}</Text>
                                <Tag colorScheme={todo.priority === "high" ? "red" : todo.priority === "medium" ? "yellow" : "blue"} mr={2}>
                                  <TagLabel>{todo.priority === "high" ? "高" : todo.priority === "medium" ? "中" : "低"}優先度</TagLabel>
                                </Tag>
                                {/* サブタスク編集 */}
                                <Box mt={2}>
                                  <Text fontSize="xs" color="gray.600">サブタスク</Text>
                                  <Stack direction="row" align="center" mb={2}>
                                    <Input size="sm" placeholder="サブタスク追加" value={newSubTask} onChange={e => setNewSubTask(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') addSubTask(todo); }} />
                                    <Button size="sm" colorScheme="purple" onClick={() => addSubTask(todo)}>追加</Button>
                                  </Stack>
                                  <CheckboxGroup colorScheme="purple" defaultValue={todo.subTasks?.filter(st => st.completed).map(st => st.id.toString())}>
                                    <Stack>
                                      {todo.subTasks?.map(st => (
                                        <Flex key={st.id} align="center" gap={2}>
                                          {editingSubTask && editingSubTask.todoId === todo.id && editingSubTask.subId === st.id ? (
                                            <Input size="sm" value={editingSubTask.value} onChange={e => setEditingSubTask({ ...editingSubTask, value: e.target.value })} onBlur={() => saveEditSubTask(todo, st.id)} onKeyDown={e => { if (e.key === 'Enter') saveEditSubTask(todo, st.id); if (e.key === 'Escape') setEditingSubTask(null); }} autoFocus />
                                          ) : (
                                            <Text fontSize="sm" flex={1} onDoubleClick={() => startEditSubTask(todo.id, st.id, st.title)}>{st.title}</Text>
                                          )}
                                          <IconButton aria-label="編集" icon={<EditIcon />} size="xs" variant="ghost" onClick={() => startEditSubTask(todo.id, st.id, st.title)} />
                                          <IconButton aria-label="削除" icon={<DeleteIcon />} size="xs" variant="ghost" colorScheme="red" onClick={() => deleteSubTask(todo, st.id)} />
                                        </Flex>
                                      ))}
                                    </Stack>
                                  </CheckboxGroup>
                                </Box>
                              </Box>
                            </Collapse>
                          </Card>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </Stack>
                )}
              </Droppable>
            </DragDropContext>
          </Stack>
        </CardBody>
      </Card>
    </Box>
  );
} 