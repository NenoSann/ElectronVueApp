<template>
    <div class="side-bar flex flex-col gap-1 p-2">
        <div class="me border-b-[1px]">
            <TheIcon @click="router.push('/login')" :img_url="imageURL"></TheIcon>
        </div>
        <div class="sidebar-icon friends" @click="() => { sidebar.sidebar = eSideBar.Friends }">
            <Icon size="36" class=" fill-primary">
                <Comments />
            </Icon>
        </div>
        <div class="sidebar-icon groups" @click="() => { sidebar.sidebar = eSideBar.Groups }">
            <Icon size="32">
                <AddressBook />
            </Icon>
        </div>
    </div>
</template>

<script setup lang="ts">
import { SideBar, TheIcon } from './index';
import { useRouter } from 'vue-router';
import { Comments, AddressBook } from '@vicons/fa';
import { Icon } from '@vicons/utils';
import { User, ComponentState, eSideBar } from '../Pinia';
import { ref, watch, computed } from 'vue';
const user = User();
const sidebar = ComponentState();
const router = useRouter();
const imageURL = computed(() => {
    return user?.avatar;
});

</script>

<style scoped>
.side-bar {
    @apply grow-0;
    @apply w-16 h-full;
    @apply bg-neutral;
    @apply bg-neutral;
}



.sidebar-icon {
    @apply flex justify-center items-center;
    @apply w-full h-[48px] rounded-xl p-1;
    @apply hover:bg-neutral-300 hover:bg-opacity-10 transition-all hover:isolate;
}

/* change the xicon fill */
:deep(.sidebar-icon > span > svg > path) {
    @apply fill-primary;
}

.sidebar-icon>svg {
    isolation: isolate;
}
</style>