<script>
    import { onDestroy } from 'svelte';
    import {userData} from "../stores.js";
    import {goto} from "$app/navigation";
    import {Button} from "@sveltestrap/sveltestrap";

    let userDataValue;

    const unsubscribe = userData.subscribe(value => {
        userDataValue = value;
    });

    onDestroy(unsubscribe);

    function redirect() {
        if (userDataValue != null) {
            goto('/mentors'); //멘토 리스트 페이지로 넘겨줌
        } else {
            goto('/auth'); //로그인 페이지로 넘겨줌
        }
    }
</script>

<h2 id="narae-your-personal-ai-mentor">Narae: Your Personal AI Mentor</h2>

<Button
        class=""
        active={false}
        block={false}
        children=""
        close={false}
        color="primary"
        disabled={false}
        href=""
        outline={false}
        size="md"
        on:click={redirect}
        value="">서비스 사용해보기</Button>
