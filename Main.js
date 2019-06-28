import React, { useState } from "react";
import { View, TextInput, StyleSheet, ScrollView, Text } from "react-native";
import { Query, Mutation } from "react-apollo";
import gql from "graphql-tag";
import { v1 } from "uuid";

const taskQuery = gql`
  query TaskQuery {
    Task {
      id
      task
    }
  }
`;

const insertTaskMutation = gql`
  mutation InsertTaskMutation($task: String!, $id: uuid) {
    insert_Task(objects: { task: $task, user_id: 1, id: $id }) {
      returning {
        id
        task
      }
    }
  }
`;

export default function Main() {
  return (
    <View style={styles.container}>
      <TextBox />
      <List />
    </View>
  );
}

const TextBox = () => {
  const [text, setText] = useState("");
  // This should come from the server
  const generateUUID = v1();

  function handleTextChange(text) {
    setText(text);
  }

  return (
    <Mutation
      mutation={insertTaskMutation}
      variables={{ task: text, id: generateUUID }}
      update={(cache, { data: { insert_Task } }) => {
        const existingTasks = cache.readQuery({ query: taskQuery });

        const newTask = [insert_Task.returning[0], ...existingTasks.Task];

        cache.writeQuery({
          query: taskQuery,
          data: { Task: newTask }
        });
      }}
      optimisticResponse={{
        __typename: "mutation_root",
        insert_Task: {
          __typename: "Task_mutation_response",
          returning: [
            {
              __typename: "Task",
              id: generateUUID,
              task: text,
              user_id: 1
            }
          ]
        }
      }}
    >
      {mutate => {
        const submit = () => {
          mutate();
          setText("");
        };

        return (
          <TextInput
            placeholder="Type somthing"
            value={text}
            onChangeText={handleTextChange}
            style={styles.textbox}
            onSubmitEditing={submit}
          />
        );
      }}
    </Mutation>
  );
};

const List = () => {
  return (
    <Query query={taskQuery}>
      {({ data, error, loading }) => {
        if (error) {
          console.error(error);
          return <Text>Error</Text>;
        }

        if (loading) {
          return <Text>Loading</Text>;
        }

        return (
          <ScrollView>
            {data.Task.map(t => {
              return (
                <View style={styles.taskItem} key={t.id}>
                  <Text>{t.task}</Text>
                </View>
              );
            })}
          </ScrollView>
        );
      }}
    </Query>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "flex-start",
    margin: 20,
    padding: 20
  },
  textbox: {
    backgroundColor: "#F8FAFB",
    width: 300,
    height: 50,
    borderRadius: 5,
    fontSize: 20,
    padding: 8,
    marginBottom: 10
  },
  taskItem: {
    marginBottom: 20,
    paddingBottom: 10,
    width: 300,
    textAlign: "left",
    borderBottomWidth: 1,
    borderBottomColor: "#434959"
  }
});
