import React from "react";
import {
  Form,
  json,
  useLoaderData,
  useNavigation,
  type ActionFunctionArgs,
} from "react-router-dom";
import { X } from "react-feather";

import VisuallyHidden from "../components/VisuallyHidden";

type Todo = {
  value: string;
  id: string;
  isCompleted?: boolean;
};

async function loader() {
  //? For now, we just use localStorage to store the todos.
  //? Once we are handling server-side logic,
  //? we can also use different types of databases here!
  const todos = JSON.parse(
    window.localStorage.getItem("todos") ?? "[]"
  ) as Todo[];

  return json({
    todos,
  });
}

async function action({ request }: ActionFunctionArgs) {
  const todos = JSON.parse(
    window.localStorage.getItem("todos") ?? "[]"
  ) as Todo[];

  const formData = await request.formData();
  const intent = formData.get("intent");

  if (intent === "addTodo") {
    const todo = formData.get("todo") as string;

    todos.push({
      value: todo,
      id: crypto.randomUUID(),
    });

    window.localStorage.setItem("todos", JSON.stringify(todos));

    return json({
      ok: true,
    });
  }

  if (intent === "toggleTodo") {
    const id = formData.get("id");

    window.localStorage.setItem(
      "todos",
      JSON.stringify(
        todos.map((todo) => {
          if (todo.id !== id) {
            return todo;
          }

          return {
            ...todo,
            isCompleted: !todo.isCompleted,
          };
        })
      )
    );

    return json({
      ok: true,
    });
  }

  if (intent === "deleteTodo") {
    const id = formData.get("id");

    window.localStorage.setItem(
      "todos",
      JSON.stringify(todos.filter((todo) => todo.id !== id))
    );

    return json({
      ok: true,
    });
  }

  throw json({ message: "Invalid intent" }, { status: 400 });
}

export default function RootRoute() {
  const { todos } = useLoaderData() as { todos: Todo[] };
  const addTodoRef = React.useRef<HTMLFormElement>(null!);

  const navigation = useNavigation();

  React.useEffect(() => {
    if (navigation.state === "submitting") {
      const intent = navigation.formData?.get("intent");

      if (intent === "addTodo") {
        addTodoRef.current.reset();
      }
    }
  }, [navigation.state, navigation.formData]);

  return (
    <div className="wrapper">
      <div className="list-wrapper">
        <ol className="todo-list">
          {todos.map(({ id, value, isCompleted }) => (
            <li key={id}>
              <Form method="POST">
                <input type="hidden" name="id" value={id} />
                <button
                  type="submit"
                  name="intent"
                  value="toggleTodo"
                  className={`
									toggle
									${isCompleted ? "completed" : undefined}
								`}
                  aria-label="toggle item"
                >
                  {value}
                  {isCompleted && <VisuallyHidden> (Completed)</VisuallyHidden>}
                </button>
                <button
                  type="submit"
                  name="intent"
                  value="deleteTodo"
                  className="delete-btn"
                >
                  <X />
                  <VisuallyHidden>Delete Item</VisuallyHidden>
                </button>
              </Form>
            </li>
          ))}
        </ol>
      </div>
      <div className="create-new-todo-wrapper">
        <Form method="POST" ref={addTodoRef}>
          <label htmlFor="new-list-form-input">New item:</label>

          <div className="row">
            <input id="new-list-form-input" type="text" name="todo" required />
            <button type="submit" name="intent" value="addTodo">
              Add
            </button>
          </div>
        </Form>
      </div>
    </div>
  );
}

RootRoute.loader = loader;
RootRoute.action = action;
