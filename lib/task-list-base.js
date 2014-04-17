$(function() {

	/********************
	 *     Constants    *
	 ********************/
	var colors = {
		newstate: "#F6F6F6",
		startedstate: "#FFFFAA",
		completedstate: "#D4FFAA",
	};
	
	var taskIds = {
		small: "small-task",
		medium: "medium-task",
		large: "large-task",
	};

	/********************
	 *     Functions    *
	 ********************/
	
	/**
	 * Save the ordering of the task list into local storage
	 */
	var saveTaskListOrder = function() {
		var taskListOrder = $("#sortableTodo").sortable("toArray");
		var completedListOrder = $("#sortableCompleted").sortable("toArray");
		var combinedOrder = $.merge( taskListOrder , completedListOrder );
		
		localStorage.setItem("taskListOrder", JSON.stringify(combinedOrder));
	}
	
	/**
	 * Get a color String depending on the task state
	 * @param state - String
	 * @return String
	 */
	var getColorOfState = function(state) {
		if(state === 'new'){
			return colors.newstate;
		} else if(state === 'started'){
			return colors.startedstate;
		} else if(state === 'completed') {
			return colors.completedstate;
		}
		throw 'State ' + state + ' not handled.';
	};
	
	/**
	 * Get a CSS Id String depending on the task complexity
	 * @param taskComplexity - String
	 * @return String
	 */
	var getTaskId = function(taskComplexity) {
		if(taskComplexity == 'S'){
			return taskIds.small;
		} else if(taskComplexity == 'M'){
			return taskIds.medium;
		} else if(taskComplexity == 'L') {
			return taskIds.large;
		}
		throw 'taskComplexity ' + taskComplexity + ' not handled.';
	}
	
	/**
	 * Takes an HTML li element and shows/hides child elements based on state
	 * @param html - HTML element
	 * @param state - String
	 * @return HTML element
	 */
	var updateTaskDisplayBasedOnState = function(html, state){
		if(state === 'new'){
			html.children('#start-button').show();
			html.children('#stop-button').hide();
			html.children('#complete-button').hide();
			html.children('#start-date').hide();
			html.children('#completion-date').hide();
		} else if(state === 'started'){
			html.children('#start-button').hide();
			html.children('#stop-button').show();
			html.children('#complete-button').show();
			html.children('#start-date').hide();
			html.children('#completion-date').hide();
		} else if(state === 'completed') {
			html.children('#start-button').hide();
			html.children('#stop-button').hide();
			html.children('#complete-button').hide();
			html.children('#start-date').show();
			html.children('#completion-date').show();
		}
		return html;
	}
	
	/**
	 * Creates an HTML element from a TaskListItem
	 * @param taskListItem - TaskListItem
	 * @return HTML element
	 */
    var generateElement = function(taskListItem){
		return $("<li id=" + taskListItem.id + " data-role='list-divider' style='background-color: " + getColorOfState(taskListItem.state) + "'><span id='"+getTaskId(taskListItem.complexity) + "'></span>" + taskListItem.taskName + "<span id='remove-button'></span><span id='complete-button'></span><span id='start-button'></span><span id='stop-button'></span><span id='completion-date'>"+taskListItem.completionDate+"</span><span id='start-date'>"+taskListItem.startDate+"</span><span id='creation-date'>"+taskListItem.creationDate+"</span></li>");
    };

	/**
	 * Adds a TaskListItem to the current page
	 * @param taskListItem - TaskListItem
	 */
	var addTaskToDisplay = function(taskListItem){
		var elem = generateElement(taskListItem);
		var listName = "#sortableTodo";
		if(taskListItem.state === 'completed') {
			listName = "#sortableCompleted";
		}
		$(listName).append(updateTaskDisplayBasedOnState(elem, taskListItem.state));
	}
	
	/**
	 * Returns today's date formatted
	 * @return String
	 */
	var getFormattedCurrentDate = function(){
		var d = new Date();
		var month = d.getMonth()+1;
		var day = d.getDate();
		var creationDate = d.getFullYear() + '/' + month + '/' + day;
		return creationDate;
	}
	
	/********************
	 *  Initialization  *
	 ********************/
	
	var taskList = JSON.parse(localStorage.getItem("taskList"));
	taskList = taskList || {};
	
	/* Set up the sortable lists */
	$( "#sortableTodo, #sortableCompleted" ).sortable({
		connectWith: ".sortable",
		cancel : 'span',
		update: function(event, ui) {
			saveTaskListOrder();
    }});
	
	/* Hook up the buttons inside each task */
	$("[id^=sortable]").delegate('li span', 'click', function () {
		var taskId = $(this).parent().attr("id");
		if('complete-button' == this.id){
			$(this).parent().css({'background-color': colors.completedstate});
			taskList[taskId].state = "completed";
			taskList[taskId].completionDate = getFormattedCurrentDate();

			//Remove the task from the top list and add to the completed list
			$(this).parent().remove();
			addTaskToDisplay(taskList[taskId]);
			$("html, body").animate({ scrollTop: $(document).height() }, "slow");
		} else if('start-button' == this.id){
			$(this).parent().css({'background-color': colors.startedstate}); 
			taskList[taskId].state = "started";
			taskList[taskId].startDate = getFormattedCurrentDate();
			updateTaskDisplayBasedOnState($(this).parent(),taskList[taskId].state);
		} else if('stop-button' == this.id){
			$(this).parent().css({'background-color': colors.newstate});
			taskList[taskId].state = "new";
			updateTaskDisplayBasedOnState($(this).parent(),taskList[taskId].state);
		} else if('remove-button' == this.id){
			$(this).parent().remove();
			delete taskList[taskId];
		}
		localStorage.setItem("taskList", JSON.stringify(taskList));
		saveTaskListOrder();
	});
	
	/* Populate the task list */
	var tempTaskListOrder = JSON.parse(localStorage.getItem("taskListOrder"));
	if ( tempTaskListOrder != null){
		for (i = 0; i < tempTaskListOrder.length; ++i) {
			addTaskToDisplay(taskList[tempTaskListOrder[i]]);
		}
	}

	/* Allow hitting enter while typing to add a task*/
	$("#addTaskTextField").keyup(function(event){
		if(event.keyCode == 13){
			$("#addTaskButton").click();
		}
	});

	/* Hook up the Add task button */
	$("#addTaskButton").click(function (e) {
		e.preventDefault();
		
		var id = new Date().getTime();
		var taskName = $("input[id='addTaskTextField']").val();
		var complexity = $('#complexityComboBox :selected').text();
		var tempTaskItem = {
			id : id,
			taskName: taskName,
			complexity: complexity,
			creationDate: getFormattedCurrentDate(),
			startDate: "",
			completionDate: "",
			state: "new"
		};
		
		// Saving element in local storage
		taskList[id] = tempTaskItem;
		localStorage.setItem("taskList", JSON.stringify(taskList));

		addTaskToDisplay(tempTaskItem);
		$("html, body").animate({ scrollTop: $(document).height() }, "slow");
		
		var taskListOrder = $("#sortableTodo").sortable("toArray");
		localStorage.setItem("taskListOrder", JSON.stringify(taskListOrder));
		$("#addTaskTextField").val("");
	});

});
