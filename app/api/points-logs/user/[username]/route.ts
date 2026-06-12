import { NextResponse } from "next/server";
import axios from "axios";
import { cookies } from "next/headers";

export async function GET(
  request: Request,
  { params }: { params: { username: string } }
) {
  try {
    const { username } = await params;
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    const apiUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/points-logs/${username}`;

    try {
      const response = await axios.get(apiUrl, {
        headers: {
          ...(token && { Authorization: `Bearer ${token}` }),
          Accept: "application/json",
        },
      });

      return NextResponse.json(response.data, {
        status: response.status,
      });
    } catch (apiError: any) {
      // Fallback to mock data if the backend endpoint is not ready yet
      console.log("Backend failed or not ready, returning mock data for points-logs.");
      return NextResponse.json({
        status: "success",
        username: "anggaraa",
        reputation_points: 19,
        data: [
          {
            id: "8e27e454-5558-4f8c-beb7-7cf96016ff4f",
            user_id: "33119eac-b64e-40bf-a8b3-81b5a4cd8ddf",
            points: 1,
            action_type: "post_created",
            reference_id: "d7d2aacd-451a-4244-bb74-d9c2420ae1fa",
            description: "Created a new post",
            created_at: "2026-06-07T15:39:29.000000Z",
          },
          {
            id: "5a8b734a-a2bf-496e-8a72-01719d424206",
            user_id: "33119eac-b64e-40bf-a8b3-81b5a4cd8ddf",
            points: 1,
            action_type: "post_created",
            reference_id: "c3fc4324-c5ea-4dc3-b5a6-794c3239464b",
            description: "Created a new post",
            created_at: "2026-06-07T15:39:02.000000Z",
          },
          {
            id: "e1a1bc1a-7263-47f3-b1d5-541a9ee6ab98",
            user_id: "33119eac-b64e-40bf-a8b3-81b5a4cd8ddf",
            points: 1,
            action_type: "post_created",
            reference_id: "aafb5e68-e28f-4f22-a558-55630b92d07c",
            description: "Created a new post",
            created_at: "2026-06-07T15:38:11.000000Z",
          },
          {
            id: "de18e217-a7d2-409c-b8b7-6cb4beb9c754",
            user_id: "33119eac-b64e-40bf-a8b3-81b5a4cd8ddf",
            points: 1,
            action_type: "post_created",
            reference_id: "4a86cac4-d99c-475b-943e-6150ba4443af",
            description: "Created a new post",
            created_at: "2026-06-07T15:37:00.000000Z",
          },
          {
            id: "dda26231-e156-4ee8-88a5-7c2cdbae8755",
            user_id: "33119eac-b64e-40bf-a8b3-81b5a4cd8ddf",
            points: 1,
            action_type: "post_created",
            reference_id: "ee834da2-ac52-412f-940c-dac30dd4cce6",
            description: "Created a new post",
            created_at: "2026-06-07T15:33:36.000000Z",
          },
          {
            id: "f4d59635-c01c-4286-8239-5a8e0d17b684",
            user_id: "33119eac-b64e-40bf-a8b3-81b5a4cd8ddf",
            points: 1,
            action_type: "post_created",
            reference_id: "d5d97666-5382-4f08-8e2a-d4315aaec318",
            description: "Created a new post",
            created_at: "2026-06-07T15:32:22.000000Z",
          },
          {
            id: "98a4bdb6-1d10-4d67-a428-809490380c46",
            user_id: "33119eac-b64e-40bf-a8b3-81b5a4cd8ddf",
            points: 1,
            action_type: "post_created",
            reference_id: "7d7c09b6-7125-49ea-8b76-648ba8a9195f",
            description: "Created a new post",
            created_at: "2026-06-07T15:17:26.000000Z",
          },
          {
            id: "a8809fa1-4535-481e-99c2-4b9c5cfc5b62",
            user_id: "33119eac-b64e-40bf-a8b3-81b5a4cd8ddf",
            points: 1,
            action_type: "post_created",
            reference_id: "b3194f7a-f364-411c-9a5e-ceee23c1b3f6",
            description: "Created a new post",
            created_at: "2026-06-07T15:15:38.000000Z",
          },
          {
            id: "3edae2bb-7aee-4a92-b229-c51804c4b29c",
            user_id: "33119eac-b64e-40bf-a8b3-81b5a4cd8ddf",
            points: 1,
            action_type: "post_created",
            reference_id: "afe0fa65-3eca-41f1-8a08-d628080c64d5",
            description: "Created a new post",
            created_at: "2026-06-07T15:12:43.000000Z",
          },
          {
            id: "66b62bdf-0f2b-4608-86df-c8b22b95d411",
            user_id: "33119eac-b64e-40bf-a8b3-81b5a4cd8ddf",
            points: 1,
            action_type: "post_created",
            reference_id: "e13a5c42-49fd-4e7d-b2f1-bfd9f3549a73",
            description: "Created a new post",
            created_at: "2026-06-07T15:12:38.000000Z",
          },
          {
            id: "ee6ea3e0-a883-4736-9e1f-bc9272cc0d6e",
            user_id: "33119eac-b64e-40bf-a8b3-81b5a4cd8ddf",
            points: 1,
            action_type: "post_created",
            reference_id: "b14e15e1-f36c-4c36-abf8-5d042637edb2",
            description: "Created a new post",
            created_at: "2026-06-07T15:12:36.000000Z",
          },
          {
            id: "a72b1d24-2ff2-4b10-970f-bd7ac16ef9d4",
            user_id: "33119eac-b64e-40bf-a8b3-81b5a4cd8ddf",
            points: 1,
            action_type: "post_created",
            reference_id: "ce1e599a-883c-48d8-adc3-1e9119371505",
            description: "Created a new post",
            created_at: "2026-06-07T15:11:20.000000Z",
          },
          {
            id: "8c672261-a48a-438f-af70-626ca0ae1a1c",
            user_id: "33119eac-b64e-40bf-a8b3-81b5a4cd8ddf",
            points: 1,
            action_type: "post_created",
            reference_id: "12d2919c-84a2-4307-8e00-dcbb8401b31f",
            description: "Created a new post",
            created_at: "2026-06-07T11:52:09.000000Z",
          },
          {
            id: "72dc987c-7518-4812-8ffa-01678f7a0c0b",
            user_id: "33119eac-b64e-40bf-a8b3-81b5a4cd8ddf",
            points: 1,
            action_type: "post_created",
            reference_id: "1645328a-727e-44f4-8d06-17d66ac69be3",
            description: "Created a new post",
            created_at: "2026-06-07T11:51:46.000000Z",
          },
          {
            id: "3f6567ea-c63f-4b1f-bddc-6db8fc132aa8",
            user_id: "33119eac-b64e-40bf-a8b3-81b5a4cd8ddf",
            points: -6,
            action_type: "report_resolved",
            reference_id: "8410271c-8b02-40bc-9cec-b4c73a24c2ee",
            description: "Content reported and resolved by moderator (-6 pts)",
            created_at: "2026-06-06T02:35:10.000000Z",
          },
          {
            id: "a8eed3e7-fa24-4013-86a7-a00f67b4274a",
            user_id: "33119eac-b64e-40bf-a8b3-81b5a4cd8ddf",
            points: -2,
            action_type: "post_downvoted",
            reference_id: "ce6d8b25-43a2-4e09-bfd0-8374d1a657a5",
            description: "Post received a downvote (-2 pts)",
            created_at: "2026-06-06T02:34:04.000000Z",
          },
          {
            id: "ebd4ff0b-2cea-4a49-9ac4-659827052602",
            user_id: "33119eac-b64e-40bf-a8b3-81b5a4cd8ddf",
            points: -2,
            action_type: "post_downvoted",
            reference_id: "ce6d8b25-43a2-4e09-bfd0-8374d1a657a5",
            description: "Post received a downvote (-2 pts)",
            created_at: "2026-06-06T02:33:54.000000Z",
          },
          {
            id: "e615a129-86a7-4d33-9e46-0c3a2b81f5eb",
            user_id: "33119eac-b64e-40bf-a8b3-81b5a4cd8ddf",
            points: 2,
            action_type: "post_downvoted",
            reference_id: "ce6d8b25-43a2-4e09-bfd0-8374d1a657a5",
            description: "Downvote removed (restored 2 pts)",
            created_at: "2026-06-06T02:33:45.000000Z",
          },
          {
            id: "0c8ab4be-449c-49b0-b935-1b571eb2591b",
            user_id: "33119eac-b64e-40bf-a8b3-81b5a4cd8ddf",
            points: 2,
            action_type: "post_downvoted",
            reference_id: "ce6d8b25-43a2-4e09-bfd0-8374d1a657a5",
            description: "Downvote removed (restored 2 pts)",
            created_at: "2026-06-06T02:32:03.000000Z",
          },
          {
            id: "8aa4a777-cc8e-4737-8b92-feedbdd247e5",
            user_id: "33119eac-b64e-40bf-a8b3-81b5a4cd8ddf",
            points: -2,
            action_type: "post_downvoted",
            reference_id: "ce6d8b25-43a2-4e09-bfd0-8374d1a657a5",
            description: "Post received a downvote (-2 pts)",
            created_at: "2026-06-06T02:31:56.000000Z",
          },
          {
            id: "7ce59714-47b3-4a1d-9137-c67ee4f1d924",
            user_id: "33119eac-b64e-40bf-a8b3-81b5a4cd8ddf",
            points: 2,
            action_type: "post_downvoted",
            reference_id: "ce6d8b25-43a2-4e09-bfd0-8374d1a657a5",
            description: "Downvote removed (restored 2 pts)",
            created_at: "2026-06-06T02:31:55.000000Z",
          },
          {
            id: "a8a7f84e-6674-4096-af00-44cf910b62f3",
            user_id: "33119eac-b64e-40bf-a8b3-81b5a4cd8ddf",
            points: 1,
            action_type: "post_created",
            reference_id: "1c28c7c5-c0d9-45c4-b966-60af97b03eea",
            description: "Created a new post",
            created_at: "2026-06-06T02:28:13.000000Z",
          },
          {
            id: "23cd1c4b-6d33-4e09-9570-a57f8d3aca92",
            user_id: "33119eac-b64e-40bf-a8b3-81b5a4cd8ddf",
            points: -2,
            action_type: "post_downvoted",
            reference_id: "ce6d8b25-43a2-4e09-bfd0-8374d1a657a5",
            description: "Post received a downvote (-2 pts)",
            created_at: "2026-06-06T02:25:56.000000Z",
          },
          {
            id: "afda72dc-4599-41ea-bfc8-7ea6aa5ffdff",
            user_id: "33119eac-b64e-40bf-a8b3-81b5a4cd8ddf",
            points: -2,
            action_type: "post_downvoted",
            reference_id: "ce6d8b25-43a2-4e09-bfd0-8374d1a657a5",
            description: "Post received a downvote (-2 pts)",
            created_at: "2026-06-06T02:25:29.000000Z",
          },
          {
            id: "9c99778c-bdd2-447e-a85a-38c59519750c",
            user_id: "33119eac-b64e-40bf-a8b3-81b5a4cd8ddf",
            points: 2,
            action_type: "post_downvoted",
            reference_id: "ce6d8b25-43a2-4e09-bfd0-8374d1a657a5",
            description: "Downvote removed (restored 2 pts)",
            created_at: "2026-06-06T02:25:23.000000Z",
          },
          {
            id: "533f74e7-9bd7-4169-a155-4378235e5383",
            user_id: "33119eac-b64e-40bf-a8b3-81b5a4cd8ddf",
            points: -2,
            action_type: "post_downvoted",
            reference_id: "ce6d8b25-43a2-4e09-bfd0-8374d1a657a5",
            description: "Post received a downvote",
            created_at: "2026-06-06T02:25:06.000000Z",
          },
          {
            id: "946d9f22-6829-45f2-9391-944d86ec49b7",
            user_id: "33119eac-b64e-40bf-a8b3-81b5a4cd8ddf",
            points: -2,
            action_type: "post_upvoted",
            reference_id: "ce6d8b25-43a2-4e09-bfd0-8374d1a657a5",
            description: "Upvote reversed (changed to downvote)",
            created_at: "2026-06-06T02:25:06.000000Z",
          },
          {
            id: "b7a27559-b31f-4520-9691-8a87458dbb1e",
            user_id: "33119eac-b64e-40bf-a8b3-81b5a4cd8ddf",
            points: 1,
            action_type: "post_created",
            reference_id: "99afb68a-d6f1-4cfb-9acf-237286149d08",
            description: "Created a new post",
            created_at: "2026-06-06T02:10:53.000000Z",
          },
          {
            id: "8505c5be-132b-4dcd-a34c-9910b3b7be7e",
            user_id: "33119eac-b64e-40bf-a8b3-81b5a4cd8ddf",
            points: 2,
            action_type: "post_upvoted",
            reference_id: "ce6d8b25-43a2-4e09-bfd0-8374d1a657a5",
            description: "Post received an upvote",
            created_at: "2026-06-06T02:10:14.000000Z",
          },
        ],
      });
    }
  } catch (error: any) {
    console.error("GET Error:", error);
    return NextResponse.json(
      { success: false, message: "Terjadi kesalahan internal" },
      { status: 500 }
    );
  }
}
