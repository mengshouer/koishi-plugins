<template>
  <div class="textarea">
    <div
      class="input-box"
      contenteditable="true"
      v-html="text"
      :placeholder="placeholder"
      @keydown="onKeydown"
      @keydown.enter.exact="onEnter"
      @paste="onPaste"
    />
  </div>
</template>

<script lang="ts" setup>
import { computed } from "vue";
import { useEventListener } from "@vueuse/core";
import segment from "@satorijs/element";

const emit = defineEmits(["send", "update:modelValue"]);

const props = withDefaults(defineProps<{
  target?: HTMLElement | Document
  modelValue?: string
  placeholder?: string
}>(), {
  target: () => document,
  modelValue: '',
})

const text = computed({
  get: () => props.modelValue,
  set: (value) => emit("update:modelValue", value),
});

function onEnter(event: KeyboardEvent) {
  event.preventDefault();
  const childNodes = (event.target as HTMLElement).childNodes;
  if (!childNodes.length) return;
  let message = "";
  for (const node of childNodes) {
    if (node.nodeType === Node.TEXT_NODE) {
      message += segment.escape(node.textContent);
    } else if (node.nodeType === Node.ELEMENT_NODE) {
      const element = node as HTMLElement;
      if (element.tagName === "BR") {
        message += "\n";
      } else if (element.tagName === "IMG") {
        message += segment("image", {
          url: element.getAttribute("src"),
        }).toString();
      } else if (element.tagName === "AUDIO") {
        message += segment("audio", {
          url: element.getAttribute("src"),
        }).toString();
      } else if (element.tagName === "VIDEO") {
        message += segment("video", {
          url: element.getAttribute("src"),
        }).toString();
      }
    }
  }
  emit("send", message);
  (event.target as HTMLInputElement).innerHTML = "";
  text.value = "";
}

function onKeydown(event: KeyboardEvent) {
  const innerHTML = (event.target as HTMLInputElement).innerHTML;
  const isEmpty = ["", "<br>"].includes(innerHTML);

  if (["ArrowUp", "ArrowDown"].includes(event.key)) {
    if (!isEmpty && text.value === "") {
      event.stopPropagation();
      return;
    }
    text.value = innerHTML;
  }

  if (isEmpty && ["Delete", "Backspace"].includes(event.key)) {
    (event.target as HTMLInputElement).innerHTML = "";
    text.value = "";
  }
}

function handleDataTransfer(event: Event, transfer: DataTransfer) {
  for (const item of transfer.items) {
    event.preventDefault();
    const file = item.getAsFile();
    const [type] = file.type.split("/", 1);
    if (!["image", "audio", "video"].includes(type)) {
      console.warn("Unsupported file type:", file.type);
      return;
    }

    const reader = new FileReader()
    reader.addEventListener('load', function () {
      emit('send', segment(type, { url: reader.result }).toString())
    }, false)
    reader.readAsDataURL(file)
  }
}

useEventListener(props.target, "drop", (event: DragEvent) => {
  handleDataTransfer(event, event.dataTransfer);
});

useEventListener(props.target, "dragover", (event: DragEvent) => {
  event.preventDefault();
});

function insertNode(node: Node) {
  const selection = window.getSelection();
  if (!selection) return;
  selection.deleteFromDocument();
  selection.getRangeAt(0).insertNode(node);
  selection.collapseToEnd();
}

function searchNodes(node: Node) {
  if (node.nodeType === Node.TEXT_NODE) {
    const text = node.textContent;
    if (text) {
      const textNode = document.createTextNode(text);
      insertNode(textNode);
    }
  } else if (node.nodeType === Node.ELEMENT_NODE) {
    const element = node as HTMLElement;
    if (element.tagName === "IMG") {
      const src = element.getAttribute("src");
      if (!src) return;
      const img = document.createElement("img");
      img.setAttribute("src", src);
      insertNode(img);
    } else {
      for (const childNode of element.childNodes) {
        searchNodes(childNode);
      }
    }
  }
}

async function onPaste(event: ClipboardEvent) {
  const transfer = event.clipboardData;
  const html = transfer.getData("text/html");
  if (!html) return;

  event.preventDefault();
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, "text/html");
  searchNodes(doc.body);
}
</script>

<style lang="scss" scoped>
[contenteditable="true"]:empty::before {
  content: attr(placeholder);
  color: #757575;
}

.input-box {
  padding: 0;
  width: 100%;
  border: none;
  outline: none;
  font-size: 1em;
  height: inherit;
  color: inherit;
  display: inline-block;
  transition: 0.3s ease;
  box-sizing: border-box;
  background-color: transparent;
  outline: none;
}
</style>
