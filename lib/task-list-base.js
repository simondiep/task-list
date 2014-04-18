$(document).ready(function() {

    function checkWidth() {
		var windowWidth = $(window).width();
		if(windowWidth < 400 ) {
			$('body').width(windowWidth-10);
		} else if(windowWidth < 750 ) {
			$('body').width(windowWidth-50);
		} else {
			$('body').width(700);
		}
		$('#addTaskTextField').width($('body').width() - 150);
    }
    // Execute on load
    checkWidth();
    // Bind event listener
    $(window).resize(checkWidth);
});

$(function() {

	/********************
	 *     Constants    *
	 ********************/
	var colors = {
		newstate: '#F6F6F6',
		startedstate: '#FFFFAA',
		completedstate: '#D4FFAA',
	};
	
	var taskIds = {
		small: 'small-task',
		medium: 'medium-task',
		large: 'large-task',
	};

	/********************
	 *     Functions    *
	 ********************/
	
	/**
	 * Save the ordering of the task list into local storage
	 */
	var saveTaskListOrder = function() {
		var taskListOrder = $('#sortableTodo').sortable('toArray');
		var completedListOrder = $('#sortableCompleted').sortable('toArray');
		var combinedOrder = $.merge( taskListOrder , completedListOrder );
		
		localStorage.setItem('taskListOrder', JSON.stringify(combinedOrder));
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
		
		var taskButtonBarDiv = html.children('#taskContainer').children('#taskButtonBar');
		if(state === 'new'){
			taskButtonBarDiv.children('#start-button').show();
			taskButtonBarDiv.children('#stop-button').hide();
			taskButtonBarDiv.children('#complete-button').hide();
			taskButtonBarDiv.children('#start-date').hide();
			taskButtonBarDiv.children('#completion-date').hide();
		} else if(state === 'started'){
			taskButtonBarDiv.children('#start-button').hide();
			taskButtonBarDiv.children('#stop-button').show();
			taskButtonBarDiv.children('#complete-button').show();
			taskButtonBarDiv.children('#start-date').hide();
			taskButtonBarDiv.children('#completion-date').hide();
		} else if(state === 'completed') {
			taskButtonBarDiv.children('#start-button').hide();
			taskButtonBarDiv.children('#stop-button').hide();
			taskButtonBarDiv.children('#complete-button').hide();
			taskButtonBarDiv.children('#start-date').show();
			taskButtonBarDiv.children('#completion-date').show();
		}
		return html;
	}
	
	/**
	 * Creates an HTML element from a TaskListItem
	 * @param taskListItem - TaskListItem
	 * @return HTML element
	 */
    var generateElement = function(taskListItem){
		return $("<li id=" + taskListItem.id + " data-role='list-divider' style='background-color: " + getColorOfState(taskListItem.state) + "'><div id='taskContainer'><div id='taskButtonBar'><span id='remove-button'></span><span id='complete-button'></span><span id='start-button'></span><span id='stop-button'></span><span id='completion-date'>"+taskListItem.completionDate+"</span><span id='start-date'>"+taskListItem.startDate+"</span><span id='creation-date'>"+taskListItem.creationDate+"</span></div><div id='taskLabel'><span id='"+getTaskId(taskListItem.complexity) + "'></span>" + taskListItem.taskName + "</div></div></li>");
    };

	/**
	 * Adds a TaskListItem to the current page
	 * @param taskListItem - TaskListItem
	 */
	var addTaskToDisplay = function(taskListItem){
		var elem = generateElement(taskListItem);
		var listName = '#sortableTodo';
		if(taskListItem.state === 'completed') {
			listName = '#sortableCompleted';
			//display the completed task header
			$('#completedTasksHeader').show();
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
	
	var taskList = JSON.parse(localStorage.getItem('taskList'));
	taskList = taskList || {};
	
	/* Set up the sortable lists */
	$( '#sortableTodo, #sortableCompleted' ).sortable({
		cancel : 'span',
		update: function(event, ui) {
			saveTaskListOrder();
    }});
	
	/* Hook up the buttons inside each task */
	$('[id^=sortable]').on('click','li div div span', function () {
		var parentContainer = $(this).parent().parent().parent();
		var taskId = parentContainer.attr('id');
		console.log(taskId);
		if('complete-button' == this.id){
			parentContainer.css({'background-color': colors.completedstate});
			taskList[taskId].state = 'completed';
			taskList[taskId].completionDate = getFormattedCurrentDate();

			//Remove the task from the top list and add to the completed list
			parentContainer.remove();
			addTaskToDisplay(taskList[taskId]);
			//Scroll to the bottom
			//$('html, body').animate({ scrollTop: $(document).height() }, 'slow');
		} else if('start-button' == this.id){
			parentContainer.css({'background-color': colors.startedstate}); 
			taskList[taskId].state = 'started';
			taskList[taskId].startDate = getFormattedCurrentDate();
			updateTaskDisplayBasedOnState(parentContainer,taskList[taskId].state);
		} else if('stop-button' == this.id){
			parentContainer.css({'background-color': colors.newstate});
			taskList[taskId].state = 'new';
			updateTaskDisplayBasedOnState(parentContainer,taskList[taskId].state);
		} else if('remove-button' == this.id){
			parentContainer.remove();
			delete taskList[taskId];
		}
		localStorage.setItem('taskList', JSON.stringify(taskList));
		saveTaskListOrder();
	});
	
	/* Hook up the task label to toggle showing of overflow text */
	$('[id^=sortable]').on('click','#taskLabel', function () {
		if($(this).css('white-space') == 'nowrap'){
			$(this).css('white-space','normal');
		} else {
			$(this).css('white-space','nowrap');
		}
	});
	
	/* Populate the task list */
	var tempTaskListOrder = JSON.parse(localStorage.getItem('taskListOrder'));
	if ( tempTaskListOrder != null){
		for (i = 0; i < tempTaskListOrder.length; ++i) {
			addTaskToDisplay(taskList[tempTaskListOrder[i]]);
		}
	}

	/* Allow hitting enter while typing to add a task*/
	$('#addTaskTextField').keyup(function(event){
		if(event.keyCode == 13){
			$('#addTaskButton').click();
		}
	});

	/* Hook up the Add task button */
	$('#addTaskButton').click(function (e) {
		e.preventDefault();
		
		var id = new Date().getTime();
		var taskName = $("input[id='addTaskTextField']").val();
		var complexity = $('#complexityComboBox :selected').text();
		var tempTaskItem = {
			id : id,
			taskName: taskName,
			complexity: complexity,
			creationDate: getFormattedCurrentDate(),
			startDate: '',
			completionDate: '',
			state: 'new'
		};
		
		// Saving element in local storage
		taskList[id] = tempTaskItem;
		localStorage.setItem('taskList', JSON.stringify(taskList));

		addTaskToDisplay(tempTaskItem);
		//Scroll to the item
		//$('html, body').animate({
		//	scrollTop: $('#'+id).offset().top
		//}, 'slow');
		
		saveTaskListOrder();
		$('#addTaskTextField').val('');
	});

	/* Initialize Radio buttons */
	$('#radio').buttonset();
});
