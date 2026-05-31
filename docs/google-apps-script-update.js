// ============================================
// UPDATED GOOGLE APPS SCRIPT FOR VERCEL FRONTEND
// ============================================
// Replace your existing Code.gs with this version
// Then deploy as Web App with "Execute as: Me" and "Who has access: Anyone"
// Copy the Web App URL and set it as NEXT_PUBLIC_GOOGLE_SCRIPT_URL in Vercel

// Keep all your existing functions (getInitialData, getTeamData, savePitch, etc.)
// Just add this doPost function at the top:

function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    const action = data.action;
    let result;

    switch (action) {
      case 'getInitialData':
        result = JSON.parse(getInitialData());
        break;
      case 'getTeamData':
        result = JSON.parse(getTeamData(data.teamId));
        break;
      case 'savePitch':
        result = JSON.parse(savePitch(data.payload));
        break;
      case 'voteForPitch':
        result = JSON.parse(voteForPitch(data.payload));
        break;
      case 'addComment':
        result = JSON.parse(addComment(data.payload));
        break;
      case 'saveTeamLog':
        result = JSON.parse(saveTeamLog(data.payload));
        break;
      case 'saveIdeaPost':
        result = JSON.parse(saveIdeaPost(data.payload));
        break;
      case 'addIdeaPostComment':
        result = JSON.parse(addIdeaPostComment(data.payload));
        break;
      case 'getScheduleData':
        result = JSON.parse(getScheduleData());
        break;
      case 'saveScheduleSlot':
        result = JSON.parse(saveScheduleSlot(data.payload));
        break;
      case 'sendScheduleEmail':
        sendScheduleEmail(data.payload);
        result = { success: true };
        break;
      default:
        throw new Error('Unknown action: ' + action);
    }

    return ContentService
      .createTextOutput(JSON.stringify({ success: true, data: result }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    return ContentService
      .createTextOutput(JSON.stringify({ success: false, error: error.message }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// Also add doGet for testing
function doGet(e) {
  return ContentService
    .createTextOutput(JSON.stringify({ 
      status: 'ok', 
      message: 'Robots Meet Culture API is running',
      timestamp: new Date().toISOString()
    }))
    .setMimeType(ContentService.MimeType.JSON);
}

// ============================================
// KEEP ALL YOUR EXISTING FUNCTIONS BELOW
// ============================================
// getInitialData(), getTeamData(), savePitch(), voteForPitch(), 
// addComment(), saveTeamLog(), saveIdeaPost(), addIdeaPostComment(),
// getScheduleData(), saveScheduleSlot(), sendScheduleEmail(), etc.
