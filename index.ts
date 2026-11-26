import { registerRootComponent } from "expo";
import { defineBackgroundTasks } from "@/features/reminders/services/backgroundTasks";

import { App } from "./App";

// As tarefas em segundo plano precisam existir antes do app montar, para
// funcionarem também com o app fechado.
defineBackgroundTasks();

registerRootComponent(App);
