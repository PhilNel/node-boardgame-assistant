<template>
  <div class="min-h-screen w-full bg-gray-100 flex flex-col">
    <!-- Header -->
    <header class="fixed top-0 left-0 w-full bg-white shadow z-20">
      <div class="flex items-center justify-between px-8 py-4">
        <h1 class="text-2xl sm:text-3xl font-semibold tracking-tight text-blue-700">Board Game Rules Assistant</h1>
        <button class="lg:hidden btn btn-secondary">
          <span class="sr-only">Open sidebar</span>
          <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      </div>
    </header>

    <div class="flex flex-1 pt-20 pb-8 px-2 sm:px-8">

      <main class="flex-1 flex flex-col items-center justify-center">
        <div class="w-full max-w-2xl flex flex-col flex-1">
          <div class="flex-1 rounded-3xl shadow-md p-8 mb-4 bg-white/60 backdrop-blur-sm border border-gray-200 min-h-[350px]">
            <div v-if="messages.length === 0" class="flex flex-col items-center justify-center h-full text-gray-500">
              <h3 class="text-xl font-semibold mb-2">Ask me anything about board game rules!</h3>
              <p class="mb-2">Try: <span class="italic">"How does movement work in Nemesis?"</span> or <span class="italic">"Can I attack through walls?"</span></p>
              <span class="text-5xl mt-4">🎲</span>
            </div>
            <div v-else class="space-y-6">
              <div v-for="message in messages" :key="message.id" :class="['flex', message.type === 'user' ? 'justify-end' : 'justify-start']">
                <div :class="[
                  'max-w-xl rounded-2xl px-6 py-4 shadow-sm',
                  message.type === 'user' 
                    ? 'bg-blue-500 text-white self-end' 
                    : 'bg-white/80 text-gray-900 self-start border border-gray-200'
                ]">
                  <p class="text-base sm:text-lg whitespace-pre-line">{{ message.content }}</p>
                  <div v-if="message.type === 'assistant' && message.sources" class="mt-3 text-xs text-gray-500">
                    <p class="font-medium">Sources:</p>
                    <ul class="list-disc list-inside mt-1">
                      <li v-for="source in message.sources" :key="source.section">
                        {{ source.section }} (Page {{ source.page_number || 'N/A' }})
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <form @submit.prevent="sendMessage" class="flex gap-2 sm:gap-4 mt-auto">
            <input
              v-model="currentMessage"
              type="text"
              placeholder="Ask a question about the rules..."
              class="input flex-1 text-lg bg-white/80 border-2 border-blue-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 rounded-2xl px-4 py-3 shadow-sm transition"
              :disabled="isLoading"
              autocomplete="off"
            />
            <button
              type="submit"
              class="btn btn-primary px-8 py-3 rounded-2xl text-lg shadow-md hover:bg-blue-600 transition"
              :disabled="!currentMessage.trim() || isLoading"
            >
              <span v-if="isLoading">Sending...</span>
              <span v-else>Send</span>
            </button>
          </form>
        </div>
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';

interface Message {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  sources?: Array<{
    section: string;
    page_number?: number;
  }>;
}

const messages = ref<Message[]>([]);
const currentMessage = ref('');
const isLoading = ref(false);

async function sendMessage() {
  if (!currentMessage.value.trim() || isLoading.value) return;

  // Add user message
  const userMessage: Message = {
    id: Date.now().toString(),
    type: 'user',
    content: currentMessage.value.trim()
  };
  messages.value.push(userMessage);

  // Clear input and set loading state
  const question = currentMessage.value;
  currentMessage.value = '';
  isLoading.value = true;

  try {
    // TODO: Replace with actual API call
    const response = await fetch('http://localhost:3000/api/rules/query', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        question,
        game_id: 'nemesis' // TODO: Make this dynamic
      })
    });

    if (!response.ok) {
      throw new Error('Failed to get answer');
    }

    const data = await response.json();

    // Add assistant message
    messages.value.push({
      id: Date.now().toString(),
      type: 'assistant',
      content: data.answer,
      sources: data.sources
    });
  } catch (error) {
    console.error('Error:', error);
    messages.value.push({
      id: Date.now().toString(),
      type: 'assistant',
      content: 'Sorry, I encountered an error while processing your question. Please try again.'
    });
  } finally {
    isLoading.value = false;
  }
}
</script> 