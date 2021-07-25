import React, { useEffect, useState } from "react";

import parts, {
  isUndefined,
  stringToDate,
  dateToString
} from "@standard-software/parts";
const { subFirst } = parts.string;

const dateFormat = (dateText) => {
  return dateToString(
    stringToDate(dateText, "YYYY-MM-DDTHH:mm:ss.SSSZ"),
    "MM/DD HH:mm:ss"
  );
};

const getFetchData = async (url) => {
  let result;
  await fetch(url)
    .then((response) => response.json())
    .then((data) => {
      result = data;
    });
  return result;
};

const App = () => {
  const [commentArray, setCommentArray] = useState([]);
  const [userArray, setUserArray] = useState([]);
  const [inputText, setInputText] = useState("");
  const [inputUserName, setInputUserName] = useState("");
  const [inputUserDescription, setInputUserDescription] = useState("");

  // // console.log("App");

  const getCommentArray = async () => {
    const _userArray = [];
    const userData = await getFetchData(
      "https://versatileapi.herokuapp.com/api/user/all/"
    );
    for (const item of userData) {
      _userArray.push({ ...item });
    }
    console.log({ _userArray });
    // setUserArray(_userArray);

    const _commentArray = [];
    const commentData = await getFetchData(
      "https://versatileapi.herokuapp.com/api/text/all/?$orderby=_created_at desc&$limit=200" +
        "&$filter=" +
        "_user_id ne 'd9ecf9245defb6b07cb86fe92a6fde9e735fc9f9'" +
        // " and " +
        // "_user_id ne 'xxxx'" +
        ""
    );
    console.log({ _userArray });
    for (const item of commentData) {
      const userName = _userArray.find((user) => {
        // return user.id === item._user_id;
      });
      // console.log({ userName });

      _commentArray.push({
        // userName:
        //   _userArray.find((user) => {
        //     return user.id === item._user_id;
        //   })?.name ?? "",
        // replyToUserName: isUndefined(item.in_reply_to_user_id)
        //   ? ""
        //   : _userArray.find((user) => {
        //       return user.id === item.in_reply_to_user_id;
        //     })?.name ?? "-",
        item: item,
        userId: item._user_id,
        text: item.text,
        createdAt: dateFormat(item._created_at),
        updatedAt: dateFormat(item._updated_at)
      });
    }

    console.log({ _commentArray });
    _commentArray.reverse();
    return _commentArray;
  };

  const postText = async (text) => {
    const response = await fetch(
      "https://versatileapi.herokuapp.com/api/text",
      {
        method: "POST",
        mode: "cors",
        cache: "no-cache",
        credentials: "same-origin",
        headers: {
          "Content-Type": "application/json",
          Authorization: "HelloWorld"
        },
        redirect: "follow",
        referrerPolicy: "no-referrer",
        body: JSON.stringify({ text })
      }
    );
    return response.json();
  };

  const postUserName = async (name, description) => {
    const response = await fetch(
      "https://versatileapi.herokuapp.com/api/user/create_user",
      {
        method: "POST",
        mode: "cors",
        cache: "no-cache",
        credentials: "same-origin",
        headers: {
          "Content-Type": "application/json",
          Authorization: "HelloWorld"
        },
        redirect: "follow",
        referrerPolicy: "no-referrer",
        body: JSON.stringify({ name, description })
      }
    );
    return response.json();
  };

  // const getUserName = async () => {
  //   const _userArray = [];
  //   const userData = await getFetchData(
  //     "https://versatileapi.herokuapp.com/api/user/all/"
  //   );
  //   for (const item of userData) {
  //     _userArray.push({ ...item });
  //   }

  //   const postResult = await postUserName("test", "test");
  //   const myUserId = postResult.id;
  //   const myUserItem = _userArray.find((userItem) => userItem.id === myUserId);

  //   await postUserName(myUserItem.name, myUserItem.description);

  //   console.log({ postResult, myUserItem });
  //   return myUserItem;
  // };

  const reloadComment = () => {
    (async () => {
      setCommentArray(await getCommentArray());
    })();
  };

  // ページロード時のデータ読み込み処理
  useEffect(() => {
    reloadComment();
  }, []);

  return (
    <div className="App">
      <header className="App-header">
        <div>
          {commentArray.map((comment, i) => {
            // console.log(comment.userName);
            return (
              <div key={i}>
                {`${comment.userName} [${subFirst(
                  comment.item._user_id,
                  10
                )}] `}
                {comment.createdAt === comment.updatedAt
                  ? `${comment.createdAt}`
                  : `${comment.createdAt}|${comment.updatedAt}`}
                <br />
                {comment.replyToUserName === "" ? null : (
                  <>
                    {`TO:${comment.replyToUserName}`} <br />
                  </>
                )}
                {comment.text
                  .split(/(\n)/)
                  .map((v) => (v === "\n" ? <br /> : v))}
                <hr />
              </div>
            );
          })}

          <div>
            <input
              type="text"
              value={inputUserName}
              onChange={(e) => {
                setInputUserName(e.target.value);
              }}
              placeholder="ユーザー名"
            />
            <input
              type="text"
              value={inputUserDescription}
              onChange={(e) => {
                setInputUserDescription(e.target.value);
              }}
              placeholder="自己紹介文"
            />
            <button
              onClick={async () => {
                await postUserName(inputUserName, inputUserDescription);
                reloadComment();
              }}
            >
              ユーザー名設定
            </button>
            <br />
            <textarea
              value={inputText}
              onChange={(e) => {
                setInputText(e.target.value);
              }}
              placeholder="投稿内容"
            />
            <button
              onClick={async () => {
                if (inputText !== "") {
                  console.log(await postText(inputText));
                  setInputText("");
                  console.log("postText", inputText);
                }
                console.log("onClick before reloadComment", inputText);
                reloadComment();
              }}
            >
              書き込み/表示更新
            </button>
            <br />
          </div>

          <br />
        </div>
      </header>
    </div>
  );
};

export default App;
