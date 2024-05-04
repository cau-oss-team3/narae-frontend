<!-- TODO 개발 -->
<script>
    import { page } from '$app/stores';
    import {onMount} from "svelte";
    import {PUBLIC_API_SERVER} from "$env/static/public";
    import {alertData, userData} from "../../stores.js";
    import {goto} from "$app/navigation";

    const id = $page.url.searchParams.get("id"); // 다른 페이지에서 파라미터로 넘겨주는 멘토 ID임

    let mentor_detail = null;
    let chat_history = [];

    onMount(() => {
        if (id == null) {
            goto('/mentors'); // 멘토 id가 없는 경우 멘토 리스트 페이지로 넘겨줌
            alert("멘토 ID가 없습니다!");
            return;
        }

        getMentor();
    });

    // 맨토 정보 불러오기
    async function getMentor() {
        const res = await fetch(PUBLIC_API_SERVER+'/mentors/'+id, {
            method: 'GET',
            headers: {
                "Content-Type": "application/json",
                "Authorization": userData.token,
            }
        })

        const json = await res.json()

        if (json.isSuccess) {
            mentor_detail = json.mentor_detail;
            chat_history = json.chat_history;
        } else {
            alertData.set({code:res.status, err:json.err});
        }
    }

</script>
<h1>
    채팅방
</h1>
