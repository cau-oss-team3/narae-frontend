<script>
    import {onDestroy, onMount} from 'svelte';
    import {page} from '$app/stores';
    import {PUBLIC_API_SERVER} from '$env/static/public';
    import {alertData} from '../../../stores.js';
    import {goto} from '$app/navigation';
    import {Container, Spinner} from '@sveltestrap/sveltestrap';
    import {userData} from "$lib/auth.js";
    import SvelteMarkdown from "svelte-markdown";
    import {writable} from 'svelte/store';

    let id = '';
    let userDataValue;
    let chatHistory = writable(null);

    const unsubscribeUserData = userData.subscribe(async (value) => {
        userDataValue = value;
    });

    onDestroy(() => {
        unsubscribeUserData();
    });

    onMount(async () => {
        id = $page.url.searchParams.get('id'); // Get mentor ID from URL parameters
        if (!id) {
            await goto('/mentors'); // Redirect if no ID is provided
            alert('멘토 ID가 없습니다!');
            return;
        }

        await getChatHistory();
    });

    async function getChatHistory() {
        const res = await fetch(PUBLIC_API_SERVER + '/chat/history/' + id, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': userDataValue.token
            },
        });

        const json = await res.json();
        if (!res.ok || json.isSuccess === false) {
            alertData.set({code: res.status, err: json});
        } else {
            chatHistory.set(json["chat"]);
        }
    }

    function formatTimestamp(timestamp) {
        return new Intl.DateTimeFormat('ko-KR', {
            year: 'numeric',
            month: 'numeric',
            day: 'numeric',
            hour: 'numeric',
            minute: 'numeric',
            second: 'numeric'
        }).format(timestamp);
    }
</script>

<style>
    .chat-list {
        height: 100%;
        overflow-y: auto;
        padding: 20px;
        background-color: #f0f2f5;
        border-radius: 10px;
        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
        display: flex;
        flex-direction: column;
    }

    .chat-message {
        max-width: 70%;
        margin-bottom: 15px;
        padding: 15px;
        border-radius: 10px;
        box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
        white-space: pre-wrap;
        align-self: flex-start;
    }

    .user-message {
        background-color: #e1f5fe;
        text-align: right;
        color: #333;
        align-self: flex-end;
    }

    .mentor-message {
        background-color: #fff3e0;
        color: #333;
    }

    .timestamp {
        display: block;
        font-size: 0.8em;
        color: #6c757d;
        margin-top: 5px;
        text-align: right;
    }

    .spinner-container {
        display: flex;
        justify-content: center;
        align-items: center;
        height: 100%;
    }
</style>

<Container fluid class="container-xl main-container" style="height: calc(100vh - 70px);">
    <div class="chat-list">
        {#if $chatHistory}
            {#each $chatHistory as chat}
                <div class="chat-message {chat.type === 0 ? 'user-message' : 'mentor-message'}">
                    <SvelteMarkdown source={chat.chat_data}/>
                    <span class="timestamp">{formatTimestamp(chat.timestamp)}</span>
                </div>
            {/each}
        {:else}
            <div class="spinner-container">
                <Spinner color="primary"/>
            </div>
        {/if}
    </div>
</Container>
